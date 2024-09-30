import { Vector } from '../math/vector';

interface PolygonProps {
  points: Vector[];
  fill: string;
  stroke: string;
  strokeWidth: number;
}

function Polygon({ points, fill, stroke, strokeWidth }: PolygonProps) {
  if (points.length < 3) return null;

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <polygon
      points={pointsString}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

export default Polygon;