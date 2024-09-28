import React from 'react';
import { Vector } from './vector';

interface VertexProps {
  point: Vector;
  index: number;
}

export const Vertex: React.FC<VertexProps> = ({ point, index }) => {
  return (
    <g>
      <circle
        cx={point.x}
        cy={point.y}
        r={10}
        fill="black"
      />
      <text
        x={point.x}
        y={point.y}
        textAnchor="middle"
        dy="0.3em"
        fill="white"
        paintOrder="stroke"
        fontSize="14"
        fontWeight="bold"
      >
        {index}
      </text>
    </g>
  );
};