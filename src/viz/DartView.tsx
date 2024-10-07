import { Vector } from '../math/vector';
import { CombinatorialMap } from '../math/CombinatorialMap';
import styled from '@emotion/styled';
import Colors from '../Colors';
import { ThetaOperation } from './ThetaOperation';
import { useState } from 'react';
import { Line } from './Line';
import { DashedArc } from './DashedArc';

interface DartViewProps {
  dart: CombinatorialMap['darts'][number];
  start: Vector;
  end: Vector;
  theta1End: Vector | null;
  isSelected: boolean;
  highlight: string;
  color?: string;
  onClick?: () => void;
  label?: string;
  renderThetaOperations?: boolean
}

const DartText = styled.text`
  pointer-events: none;
  user-select: none;
`

const DartLine = styled.line`
  &:hover {
    stroke-width: 8;
  }
`

export const DartView = ({ 
  dart, 
  start, 
  end, 
  theta1End,
  isSelected, 
  highlight, 
  color = Colors.mediumGray,
  onClick,
  label,
  renderThetaOperations = true
}: DartViewProps) => {

  const [hovered, setHovered] = useState(false)

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  
  const dartEndX = start.x + dx * 0.3;
  const dartEndY = start.y + dy * 0.3;
  
  const midX = start.x + dx * 0.18;
  const midY = start.y + dy * 0.18;

  let stroke = color;

  // Calculate arrow points
  const arrowWidth = 6;
  const arrowLength = 8;
  const hitAreaWidth = 12;

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

    const distance = 55
    const currentMidPoint = new Vector(dx, dy).normalize().scale(distance);
    const nextMidPoint = new Vector(theta1End.x - start.x, theta1End.y - start.y).normalize().scale(distance);

    return (

      <>
        <DashedArc
          center={start}
          start={nextMidPoint.scale(0.9).add(start)}
          end={currentMidPoint.scale(0.9).add(start)} 
          strokeWidth={1} 
          stroke="rgba(0, 0, 100, 0.3)"
          dashArray="4 4"
          label='θ₁'
        />
      </>      
    );
  };

  return (
    <g onClick={(e) => {onClick && e.stopPropagation(); onClick?.()}}>
      <path
        d={hitboxPath}
        fill="transparent"
        stroke="transparent"
        style={{ cursor: onClick ? 'pointer' : 'unset' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <DartLine
        x1={start.x}
        y1={start.y}
        x2={dartEndX}
        y2={dartEndY}
        stroke={stroke}
        strokeWidth={(isSelected || (hovered && onClick) || highlight !== '') ? "4" : "2"}
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
        {label || dart.index}
      </DartText>
      {renderThetaOperations && isSelected && renderTheta0()}
      {renderThetaOperations && isSelected && !dart.removed && renderTheta1()}
    </g>
  );
};