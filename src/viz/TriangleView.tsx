import React from 'react';
import { Vector } from '../math/vector';

interface TriangleViewProps {
  points: [Vector, Vector, Vector];
  stroke: string;
  strokeWidth: number;
}

export const TriangleView: React.FC<TriangleViewProps> = ({ points, stroke, strokeWidth }) => {
  return (
    <polygon
      points={points.map(p => `${p.x},${p.y}`).join(' ')}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};