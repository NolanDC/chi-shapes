import React from 'react';
import { Vector } from '../math/vector';
import { CombinatorialMap } from '../math/CombinatorialMap';
import styled from '@emotion/styled';
import Colors from '../Colors';
import { ThetaOperation } from './ThetaOperation';

interface DartViewProps {
  dart: CombinatorialMap['darts'][number];
  start: Vector;
  end: Vector;
  theta1End: Vector | null;
  isHovered: boolean;
  highlight: string;
  color?: string;
  opacity?: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  label?: string;
  renderThetaOperations?: boolean
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
  color = Colors.mediumGray,
  opacity = 0.8,
  onMouseEnter, 
  onMouseLeave,
  label,
  renderThetaOperations = true
}) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  
  const dartEndX = start.x + dx * 0.3;
  const dartEndY = start.y + dy * 0.3;
  
  const midX = start.x + dx * 0.18;
  const midY = start.y + dy * 0.18;

  let stroke = color;
  if (isHovered) {
    stroke = 'rgba(255, 0, 0, 0.8)';
  } else if (highlight) {
    stroke = highlight;
  }

  // Calculate arrow points
  const arrowWidth = 6;
  const arrowLength = 8;
  const hitAreaWidth = 10;

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

  const renderTheta0 = () => {
    const midPoint = new Vector(
      start.x + dx * 0.5,
      start.y + dy * 0.5
    );

    return (
      <ThetaOperation
        x={midPoint.x}
        y={midPoint.y}
        type="0"
      />
    );
  };

  const renderTheta1 = () => {
    if (!theta1End) return null;

    const distance = 50
    const currentMidPoint = new Vector(dx, dy).normalize().scale(distance).add(start);
    const nextMidPoint = new Vector(theta1End.x - start.x, theta1End.y - start.y).normalize().scale(distance).add(start);
    const theta1Point = currentMidPoint.add(nextMidPoint.sub(currentMidPoint).scale(0.5));

    return (
      <ThetaOperation
        x={theta1Point.x}
        y={theta1Point.y}
        type="1"
      />
    );
  };

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <path
        d={hitboxPath}
        fill="transparent"
        stroke="transparent"
        style={{ cursor: 'pointer' }}
      />
      <line
        x1={start.x}
        y1={start.y}
        x2={dartEndX}
        y2={dartEndY}
        stroke={stroke}
        strokeWidth={(isHovered || highlight !== '') ? "4" : "2"}
        opacity={opacity}
        pointerEvents="none"
      />
      <polygon
        points={`0,${-arrowWidth} ${arrowLength},0 0,${arrowWidth}`}
        fill={stroke}
        opacity={opacity}
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
        opacity={opacity}
      >
        {label || dart.index}
      </DartText>
      {renderThetaOperations && isHovered && renderTheta0()}
      {renderThetaOperations && isHovered && renderTheta1()}
    </g>
  );
};