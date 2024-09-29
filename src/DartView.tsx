import React from 'react';
import { Vector } from './vector';
import { CombinatorialMap } from './CombinatorialMap';
import styled from '@emotion/styled';

interface DartViewProps {
  dart: CombinatorialMap['darts'][number];
  start: Vector;
  end: Vector;
  theta1End: Vector | null;
  isHovered: boolean;
  highlight: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const DartText = styled.text`
  pointer-events: none;
  user-select: none;
`

export const DartView: React.FC<DartViewProps> = ({ 
  dart, 
  start, 
  end, 
  theta1End,
  isHovered, 
  highlight, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  
  const dartEndX = start.x + dx * 0.3;
  const dartEndY = start.y + dy * 0.3;
  
  const midX = start.x + dx * 0.18;
  const midY = start.y + dy * 0.18;

  let stroke = 'rgba(127, 127, 127, 1)';
  if (isHovered) {
    stroke = 'rgba(255, 0, 0, 0.8)';
  } else if (highlight) {
    stroke = highlight;
  }

  // Calculate arrow points
  const arrowWidth = 6;
  const arrowLength = 8;
  const hitAreaWidth = 10; // Width of the hit area around the dart line

  // Calculate points for the hit area
  const perpAngle = angle + Math.PI / 2;
  const hitAreaOffsetX = Math.cos(perpAngle) * hitAreaWidth / 2;
  const hitAreaOffsetY = Math.sin(perpAngle) * hitAreaWidth / 2;

  // Create refined hitbox path
  const hitboxPath = `
    M ${start.x + hitAreaOffsetX} ${start.y + hitAreaOffsetY}
    L ${dartEndX + hitAreaOffsetX} ${dartEndY + hitAreaOffsetY}
    L ${dartEndX + Math.cos(angle + Math.PI / 2) * arrowWidth} ${dartEndY + Math.sin(angle + Math.PI / 2) * arrowWidth}
    L ${dartEndX + Math.cos(angle) * arrowLength} ${dartEndY + Math.sin(angle) * arrowLength}
    L ${dartEndX + Math.cos(angle - Math.PI / 2) * arrowWidth} ${dartEndY + Math.sin(angle - Math.PI / 2) * arrowWidth}
    L ${dartEndX - hitAreaOffsetX} ${dartEndY - hitAreaOffsetY}
    L ${start.x - hitAreaOffsetX} ${start.y - hitAreaOffsetY}
    Z
  `;

  const renderTheta1Line = () => {
    if (!theta1End || dart.removed) return null;

    return (
      <line
        x1={dartEndX}
        y1={dartEndY}
        x2={theta1End.x}
        y2={theta1End.y}
        stroke={isHovered ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.3)"}
        strokeWidth={isHovered ? 2 : 1}
        strokeDasharray="4 4"
      />
    );
  };

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {/* Refined invisible hitbox */}
      <path
        d={hitboxPath}
        fill="transparent"
        stroke="transparent"
        style={{ cursor: 'pointer' }}
      />
      {/* Visible dart line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={dartEndX}
        y2={dartEndY}
        stroke={stroke}
        strokeWidth={(isHovered || highlight !== '') ? "4" : "2"}
        pointerEvents="none"
      />
      <polygon
        points={`0,${-arrowWidth} ${arrowLength},0 0,${arrowWidth}`}
        fill={stroke}
        transform={`translate(${dartEndX},${dartEndY}) rotate(${angle * 180 / Math.PI})`}
        pointerEvents="none"
      />
      <DartText
        x={midX}
        y={midY}
        dominantBaseline="middle"
        textAnchor="middle"
        fill="black"
        stroke="white"
        strokeWidth="4"
        paintOrder="stroke"
        fontSize="12"
        fontWeight="bold"
      >
        {dart.index}
      </DartText>
      {/*renderTheta1Line()*/}
    </g>
  );
};