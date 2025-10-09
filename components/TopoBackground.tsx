import { useEffect, useState, useRef, useMemo } from 'react';
import { line, curveCardinal } from 'd3-shape';
import classes from 'utils/classes';

interface ContourLine {
  level: number;
  paths: number[][][]; // Array of paths, each path is an array of [x, y] points
}

interface TopoData {
  contours: ContourLine[];
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  gridResolution: number;
  elevationRange: {
    min: number;
    max: number;
  };
}

interface TopoBackgroundProps {
  className?: string;
}

// Use D3's line generator with Catmull-Rom curve for smooth SVG paths
const lineGenerator = line<number[]>()
  .x(d => d[0])
  .y(d => d[1])
  .curve(curveCardinal.tension(0)); // 0 = smoothest

// Generate smooth SVG path data using D3
function generateSmoothPath(points: number[][], closed: boolean = false): string {
  if (points.length < 2) return '';
  
  // Basic validation - just check for NaN values
  const validPoints = points.filter(point => 
    Array.isArray(point) && 
    point.length >= 2 && 
    !isNaN(point[0]) && 
    !isNaN(point[1])
  );
  
  if (validPoints.length < 2) {
    console.warn('Not enough valid points for path:', points.length, validPoints.length);
    return '';
  }

  // resample points with consistent spacing
  const spacing = 10;

  
  
  let pathData = lineGenerator(validPoints);
  if (!pathData) {
    console.warn('D3 line generator returned empty path for points:', validPoints);
    return '';
  }
  
  // For closed paths, add the Z command
  if (closed) {
    pathData += ' Z';
  }
  
  return pathData;
}

export default function TopoBackground({ className }: TopoBackgroundProps) {
  const [topoData, setTopoData] = useState<TopoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [docHeight, setDocHeight] = useState<number>(typeof window !== 'undefined' ? document.documentElement.scrollHeight : 1000);

  // Calculate SVG viewBox to fit the data
  const viewBoxWidth = topoData?.gridResolution || 1000;
  const viewBoxHeight = docHeight;

  useEffect(() => {
    function updateDocHeight() {
      setDocHeight(document.documentElement.scrollHeight);
    }
    updateDocHeight();
    window.addEventListener('resize', updateDocHeight);
    window.addEventListener('scroll', updateDocHeight);
    return () => {
      window.removeEventListener('resize', updateDocHeight);
      window.removeEventListener('scroll', updateDocHeight);
    };
  }, []);

  useEffect(() => {
    async function fetchTopoData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/topo-data');
        if (!response.ok) {
          throw new Error(`Failed to fetch topographic data: ${response.status}`);
        }
        const data: TopoData = await response.json();
        setTopoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopoData();
  }, []);

  const svgElement = useMemo(() => {
    const touchesEdge = (points: number[][]) =>
      points.some(([x, y]) =>
        x <= 0 || x >= viewBoxWidth - 1 || y <= 0 || y >= viewBoxHeight - 1
      );
    if (!topoData) return null;
    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid slice"
        className="topo-svg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: `${docHeight}px`,
          zIndex: -1,
          opacity: 0.015,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <defs>
          <linearGradient id="contourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {topoData.contours.map((contour, index) => (
          <g key={contour.level} className="contour-group">
            {contour.paths.map((points, pathIndex) => {
              if (!Array.isArray(points) || points.length < 2) return null;
              // Basic validation - just check for NaN values
              const hasValidPoints = points.every(point => 
                Array.isArray(point) && 
                point.length >= 2 && 
                !isNaN(point[0]) && 
                !isNaN(point[1])
              );
              if (!hasValidPoints) {
                return null;
              }
              const closed = !touchesEdge(points);
              const d = generateSmoothPath(points, closed);
              if (!d) {
                return null;
              }
              const pathKey = `${contour.level}-${pathIndex}`;
              return (
                <path
                  key={pathKey}
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="contour-line"
                  shapeRendering="geometricPrecision"
                />
              );
            })}
          </g>
        ))}
      </svg>
    );
  }, [topoData, viewBoxWidth, viewBoxHeight, docHeight]);

  if (isLoading || error || !topoData || !svgElement) {
    return null;
  }

  return (
    <div className={classes('topo-background', className)} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: `${docHeight}px`, zIndex: -1, pointerEvents: 'none' }}>
      {svgElement}
      <style jsx>{`
        .topo-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100%;
          overflow: hidden;
          z-index: -1;
          background: var(--background-color);
          pointer-events: none;
        }
        .topo-svg {
          color: var(--text-color);
        }
        .contour-line {
          opacity: 0;
        }
        .app.dark .topo-svg {
          opacity: 0.01;
        }
        @media (max-width: 768px) {
          .topo-svg {
            opacity: 0.01;
          }
        }
      `}</style>
    </div>
  );
}
