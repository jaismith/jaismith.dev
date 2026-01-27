import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useWasm } from './useWasm';
import { useImages } from './useImages';
import type { SiteContent, HitAction } from './types';
import type { Renderer } from 'lib/wasm/ascii_renderer';

import styles from './AsciiCanvas.module.css';

interface AsciiCanvasProps {
  content: SiteContent;
  imageUrls: Map<string, string>;
}

// Character dimensions for the monospace font
const CHAR_WIDTH = 9.6;
const CHAR_HEIGHT = 18;
const FONT_FAMILY = '"Courier New", Consolas, Monaco, monospace';
const FONT_SIZE = 15;

export function AsciiCanvas({ content, imageUrls }: AsciiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ cols: 80, rows: 40 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const scrollRef = useRef(0);
  const router = useRouter();

  // Initialize WASM
  const { renderer, loading, error } = useWasm(dimensions.cols, dimensions.rows);
  
  // Image loading
  const { loadImage, imagesLoaded } = useImages(renderer);

  // Calculate dimensions based on window size
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const cols = Math.floor(width / CHAR_WIDTH);
    const rows = Math.floor(height / CHAR_HEIGHT);
    
    setDimensions({ cols: Math.max(40, cols), rows: Math.max(20, rows) });
  }, []);

  // Set up resize observer
  useEffect(() => {
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [updateDimensions]);

  // Load images
  useEffect(() => {
    imageUrls.forEach((url, id) => {
      loadImage(id, url);
    });
  }, [imageUrls, loadImage]);

  // Update content when it changes
  useEffect(() => {
    if (!renderer) return;
    
    try {
      renderer.set_content(JSON.stringify(content));
    } catch (err) {
      console.error('Failed to set content:', err);
    }
  }, [renderer, content, imagesLoaded]);

  // Render loop
  const renderFrame = useCallback(() => {
    if (!renderer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get render data from WASM
    const data = renderer.render();
    const cols = renderer.get_width();
    const rows = renderer.get_height();

    // Set canvas size
    const pixelWidth = cols * CHAR_WIDTH;
    const pixelHeight = rows * CHAR_HEIGHT;
    
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    // Clear canvas with theme background
    const isDark = content.page === 'resume';
    ctx.fillStyle = isDark ? '#181a1b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set font
    ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
    ctx.textBaseline = 'top';

    // Render each character
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = (row * cols + col) * 4;
        const charCode = data[idx];
        const fgColor = data[idx + 1];
        const bgColor = data[idx + 2];
        const flags = data[idx + 3];

        const x = col * CHAR_WIDTH;
        const y = row * CHAR_HEIGHT;

        // Draw background if not transparent
        if (bgColor !== 0) {
          ctx.fillStyle = colorToRgba(bgColor);
          ctx.fillRect(x, y, CHAR_WIDTH, CHAR_HEIGHT);
        }

        // Draw character if not space
        if (charCode !== 32) {
          const char = String.fromCharCode(charCode);
          ctx.fillStyle = colorToRgba(fgColor);
          
          // Handle bold
          if (flags & 0x01) {
            ctx.font = `bold ${FONT_SIZE}px ${FONT_FAMILY}`;
          } else {
            ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
          }
          
          ctx.fillText(char, x, y + 2);

          // Handle underline
          if (flags & 0x02) {
            ctx.beginPath();
            ctx.moveTo(x, y + CHAR_HEIGHT - 2);
            ctx.lineTo(x + CHAR_WIDTH, y + CHAR_HEIGHT - 2);
            ctx.strokeStyle = colorToRgba(fgColor);
            ctx.stroke();
          }
        }
      }
    }
  }, [renderer, content.page]);

  // Animation loop
  useEffect(() => {
    if (!renderer) return;

    let running = true;
    
    function loop() {
      if (!running) return;
      renderFrame();
      animationFrameRef.current = requestAnimationFrame(loop);
    }
    
    loop();
    
    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderer, renderFrame]);

  // Handle scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!renderer) return;
    e.preventDefault();
    
    const delta = Math.sign(e.deltaY) * 3;
    const currentScroll = renderer.get_scroll();
    const maxScroll = renderer.get_content_height() - dimensions.rows;
    const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + delta));
    
    renderer.set_scroll(newScroll);
    scrollRef.current = newScroll;
  }, [renderer, dimensions.rows]);

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!renderer || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CHAR_WIDTH);
    const y = Math.floor((e.clientY - rect.top) / CHAR_HEIGHT);

    const actionJson = renderer.hit_test(x, y);
    if (!actionJson) return;

    try {
      const action: HitAction = JSON.parse(actionJson);
      
      if (action.Navigate) {
        router.push(action.Navigate);
      } else if (action.OpenUrl) {
        window.open(action.OpenUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('Failed to parse hit action:', err);
    }
  }, [renderer, router]);

  // Handle mouse move for hover effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!renderer || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CHAR_WIDTH);
    const y = Math.floor((e.clientY - rect.top) / CHAR_HEIGHT);

    renderer.set_hover(x, y);
    
    // Update cursor
    const isHoverable = renderer.is_hoverable(x, y);
    canvasRef.current.style.cursor = isHoverable ? 'pointer' : 'default';
  }, [renderer]);

  // Set up wheel event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading ASCII renderer...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Failed to load renderer: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
}

// Convert packed RGBA to CSS color string
function colorToRgba(packed: number): string {
  const r = packed & 0xff;
  const g = (packed >> 8) & 0xff;
  const b = (packed >> 16) & 0xff;
  const a = ((packed >> 24) & 0xff) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default AsciiCanvas;
