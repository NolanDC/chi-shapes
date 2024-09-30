import React from 'react';
import { Vector } from '../math/vector';
import styled from '@emotion/styled';
import Colors from '../Colors';

interface VertexProps {
  point: Vector;
  index: number;
  color?: string;
  strokeColor?: string;
  textColor?: string
}

const VertexNumber = styled.text`
  pointer-events: none;
  user-select: none;
  font-weight: bold;
`

export const Vertex: React.FC<VertexProps> = ({ point, index, color = "#50434f", textColor = "white", strokeColor = Colors.purple }) => {
  return (
    <g>
      <circle
        cx={point.x}
        cy={point.y}
        r={12}
        fill={color}
        stroke={strokeColor}
        strokeWidth={3}
      />
      <VertexNumber
        x={point.x}
        y={point.y}
        textAnchor="middle"
        dy="0.35em"
        fill={textColor}
        paintOrder="stroke"
        fontSize={index.toString().length > 1 ? "12" : "14"}
      >
        {index}
      </VertexNumber>
    </g>
  );
};