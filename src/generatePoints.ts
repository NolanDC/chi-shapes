import { Vector } from "./math/vector";

export const jitteredGridPoints = (num: number, svgRef: React.RefObject<SVGSVGElement>): Vector[] => {
  if (!svgRef.current) return [];

  const svgRect = svgRef.current.getBoundingClientRect();
  const padding = 40;
  const width = svgRect.width - padding * 2;
  const height = svgRect.height - padding * 2;

  // Calculate grid dimensions
  const gridSize = Math.ceil(Math.sqrt(num));
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const points: Vector[] = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (points.length >= num) break;

      // Calculate base position
      const baseX = i * cellWidth;
      const baseY = j * cellHeight;

      // Add randomness within the cell
      const jitterX = Math.random() * cellWidth;
      const jitterY = Math.random() * cellHeight;

      // Create the point
      const x = baseX + jitterX + padding;
      const y = baseY + jitterY + padding;

      points.push(new Vector(x, y));
    }
    if (points.length >= num) break;
  }

  return points;
};

export const randomPoints = (num: number, svgRect: DOMRect) => {
  const padding = 40
  const width = svgRect.width - padding*2;
  const height = svgRect.height - padding*2;
  
  return Array.from({ length: num }, () => 
    new Vector(Math.random() * width + padding, Math.random() * height + padding)
  );
};

export const simplePoints = () => {
  return [
    new Vector(224 * 2, 323 * 2),
    new Vector(216 * 2, 165 * 2),
    new Vector(62 * 2, 407 * 2),
    new Vector(273 * 2, 375 * 2)
  ]
}