import { NextApiRequest, NextApiResponse } from 'next';
import { contours } from 'd3-contour';

interface ContourLine {
  level: number;
  paths: number[][][]; // Array of paths, each path is an array of [x, y] points
}

// Fixed location for now (can be made configurable later)
const DEFAULT_BOUNDS = {
  minLat: 43.7, // Dartmouth area
  maxLat: 43.8,
  minLng: -72.3,
  maxLng: -72.2
};

const GRID_RESOLUTION = 100; // 50x50 grid for reasonable detail/performance

async function fetchElevationData(bounds: typeof DEFAULT_BOUNDS): Promise<number[]> {
  const width = GRID_RESOLUTION;
  const height = GRID_RESOLUTION;
  
  // USGS National Map API endpoint
  const bbox = `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`;
  const url = `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage?` +
    `bbox=${bbox}&bboxSR=4326&size=${width},${height}&format=tiff&pixelType=F32&noDataInterpretation=esriNoDataMatchAny&interpolation=+RSP_BilinearInterpolation&f=image`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USGS API error: ${response.status}`);
    }
    
    // For now, we'll generate synthetic elevation data
    // In production, you'd parse the actual TIFF response
    return generateSyntheticElevationData(width, height);
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    // Fallback to synthetic data
    return generateSyntheticElevationData(width, height);
  }
}

function generateSyntheticElevationData(width: number, height: number): number[] {
  const data: number[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const normalizedDistance = distance / maxDistance;
      
      // Create a mountain-like elevation pattern
      const elevation = 1000 + 500 * Math.exp(-normalizedDistance * 2) + 
                       200 * Math.sin(x * 0.1) * Math.cos(y * 0.1);
      
      data.push(Math.round(elevation));
    }
  }
  
  return data;
}

// Robustly convert D3 contour polygons (Polygon or MultiPolygon) to flat array of paths
function contourToPaths(contour: any): number[][][] {
  if (!contour.coordinates || contour.coordinates.length === 0) return [];
  if (contour.type === 'MultiPolygon') {
    // MultiPolygon: array of array of rings
    return contour.coordinates.flatMap(
      (polygon: number[][][]) =>
        polygon.map((ring: number[][]) =>
          ring.map(([y, x]) => [x, y])
        )
    );
  }
  if (contour.type === 'Polygon') {
    // Polygon: array of rings
    return contour.coordinates.map(
      (ring: number[][]) => ring.map(([y, x]) => [x, y])
    );
  }
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const elevationData = await fetchElevationData(DEFAULT_BOUNDS);
    const minElevation = Math.min(...elevationData);
    const maxElevation = Math.max(...elevationData);

    // Generate contour levels
    const numLevels = 75;
    const contourLevels: number[] = [];
    for (let i = 0; i < numLevels; i++) {
      const level = minElevation + (maxElevation - minElevation) * (i / (numLevels - 1));
      contourLevels.push(Math.round(level));
    }

    // Generate all contours at once
    const contourGenerator = contours()
      .size([GRID_RESOLUTION, GRID_RESOLUTION])
      .thresholds(contourLevels);

    const contourData = contourGenerator(elevationData);

    // Group paths by level
    const levelToPaths: Record<number, number[][][]> = {};
    contourData.forEach(contour => {
      const paths = contourToPaths(contour).filter(path => path.length > 1);
      if (!levelToPaths[contour.value]) levelToPaths[contour.value] = [];
      levelToPaths[contour.value].push(...paths);
    });

    // Build output
    const allContours: ContourLine[] = contourLevels.map(level => ({
      level,
      paths: levelToPaths[level] || []
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      contours: allContours,
      bounds: DEFAULT_BOUNDS,
      gridResolution: GRID_RESOLUTION,
      elevationRange: { min: minElevation, max: maxElevation }
    });

  } catch (error) {
    console.error('Error generating topographic data:', error);
    res.status(500).json({ message: 'Error generating topographic data' });
  }
}
