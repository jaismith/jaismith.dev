import { useState, useEffect, useCallback, useRef } from 'react';
import type { Renderer } from 'lib/wasm/ascii_renderer';

interface ImageInfo {
  id: string;
  url: string;
}

interface UseImagesResult {
  loadImage: (id: string, url: string) => void;
  imagesLoaded: Set<string>;
  loading: boolean;
}

export function useImages(renderer: Renderer | null): UseImagesResult {
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const pendingImages = useRef<Map<string, string>>(new Map());
  const loadingImages = useRef<Set<string>>(new Set());

  const loadImage = useCallback((id: string, url: string) => {
    if (imagesLoaded.has(id) || loadingImages.current.has(id)) {
      return;
    }
    pendingImages.current.set(id, url);
  }, [imagesLoaded]);

  useEffect(() => {
    if (!renderer) return;

    async function loadPendingImages() {
      const pending = Array.from(pendingImages.current.entries());
      if (pending.length === 0) return;

      setLoading(true);
      pendingImages.current.clear();

      for (const [id, url] of pending) {
        if (loadingImages.current.has(id)) continue;
        loadingImages.current.add(id);

        try {
          const imageData = await loadImageData(url);
          if (imageData) {
            renderer.load_image(
              id,
              imageData.data,
              imageData.width,
              imageData.height
            );
            setImagesLoaded(prev => new Set([...prev, id]));
          }
        } catch (err) {
          console.error(`Failed to load image ${id}:`, err);
        } finally {
          loadingImages.current.delete(id);
        }
      }

      setLoading(false);
    }

    const interval = setInterval(loadPendingImages, 100);
    return () => clearInterval(interval);
  }, [renderer]);

  return { loadImage, imagesLoaded, loading };
}

async function loadImageData(url: string): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create a canvas to extract pixel data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Scale down large images for better ASCII conversion
      const maxDim = 200;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, width, height);
      resolve({
        data: new Uint8Array(imageData.data.buffer),
        width,
        height,
      });
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };

    img.src = url;
  });
}

export default useImages;
