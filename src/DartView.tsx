import React from 'react';
import { Vector } from './vector';
import { CombinatorialMap } from './CombinatorialMap';

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
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  const dartEndX = start.x + dx * 0.3;
  const dartEndY = start.y + dy * 0.3;
  
  const midX = start.x + dx * 0.15;
  const midY = start.y + dy * 0.15;

  let stroke = 'rgba(0, 0, 0, 0.5)';
  if (isHovered) {
    stroke = 'rgba(255, 0, 0, 0.8)';
  } else if (highlight) {
    stroke = highlight;
  }

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
      <line
        x1={start.x}
        y1={start.y}
        x2={dartEndX}
        y2={dartEndY}
        stroke={stroke}
        strokeWidth={(isHovered || highlight !== '') ? "4" : "2"}
      />
      <polygon
        points={(isHovered || highlight !== '') ? "0,-6 8,0 0,6" : "0,-4 6,0 0,4"}
        fill={stroke}
        transform={`translate(${dartEndX},${dartEndY}) rotate(${angle})`}
      />
      <text
        x={midX}
        y={midY}
        dy="-5"
        textAnchor="middle"
        fill="black"
        stroke="white"
        strokeWidth="2"
        paintOrder="stroke"
        fontSize="12"
        fontWeight="bold"
      >
        {dart.index}{dart.removed ? 'r' : ''}
      </text>
      {renderTheta1Line()}
    </g>
  );
};

// ... (Vertex, Line, and Triangle components remain the same)

// We can remove the ArrowMarker as it's no longer needed