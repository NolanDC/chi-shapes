import React, { useState } from 'react';
import { Vector } from '../math/vector';
import styled from '@emotion/styled';
import Colors from '../Colors';

interface VertexProps {
  point: Vector;
  index: number;
  color?: string;
  strokeColor?: string;
  textColor?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const VertexCircle = styled.circle<{ $isHovered: boolean; $interactive: boolean }>`
  transition: stroke-width 0.2s ease-in-out;
  stroke-width: ${props => (props.$isHovered && props.$interactive ? '5px' : '3px')};
  cursor: pointer;
`;

const VertexNumber = styled.text`
  pointer-events: none;
  user-select: none;
  font-weight: bold;
`;

const MinusSign = styled.text<{ $isHovered: boolean }>`
  opacity: ${props => (props.$isHovered ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  pointer-events: none;
  user-select: none;
  font-weight: bold;
`;

export const Vertex: React.FC<VertexProps> = ({ 
  point, 
  index, 
  color = "#50434f", 
  textColor = "white", 
  strokeColor = Colors.purple,
  interactive = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) setIsHovered(false);
  };

  return (
    <g
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {e.stopPropagation(); onClick?.()}}
    >
      <VertexCircle
        cx={point.x}
        cy={point.y}
        r={12}
        fill={color}
        stroke={strokeColor}
        $isHovered={isHovered}
        $interactive={interactive}
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
      {interactive && (
        <MinusSign
          x={point.x - 18}
          y={point.y - 10}
          fill="#50434f"
          fontSize="24"
          $isHovered={isHovered}
        >
          -
        </MinusSign>
      )}
    </g>
  );
};