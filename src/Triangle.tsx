import React from 'react';
import { Vector } from './vector';

interface TriangleProps {
  points: [Vector, Vector, Vector];
  stroke: string;
  strokeWidth: number;
}

export const Triangle: React.FC<TriangleProps> = ({ points, stroke, strokeWidth }) => {
  return (
    <polygon
      points={points.map(p => `${p.x},${p.y}`).join(' ')}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};