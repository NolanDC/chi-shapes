import { Vector } from '../math/vector';

interface TriangleViewProps {
  points: [Vector, Vector, Vector];
  stroke: string;
  fill: string;
  strokeWidth: number;
}

export const TriangleView = ({ points, fill, stroke, strokeWidth }: TriangleViewProps) => {
  return (
    <polygon
      points={points.map(p => `${p.x},${p.y}`).join(' ')}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};