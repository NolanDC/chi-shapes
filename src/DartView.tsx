import React from 'react';
import { Vector } from './vector';
import { CombinatorialMap } from './CombinatorialMap';

interface DartViewProps {
  dart: CombinatorialMap['darts'][number];
  start: Vector;
  end: Vector;
  isHovered: boolean;
  highlight: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const DartView: React.FC<DartViewProps> = ({ dart, start, end, isHovered, highlight, onMouseEnter, onMouseLeave }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  const dartEndX = start.x + dx * 0.3;
  const dartEndY = start.y + dy * 0.3;
  
  const midX = start.x + dx * 0.15;
  const midY = start.y + dy * 0.15;

  let stroke = 'rgba(0, 0, 0, 0.5)'
  if (isHovered) {
    stroke = 'rgba(255, 0, 0, 0.8)'
  } else if (highlight) {
    stroke = highlight
  }

  return (
    <g onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <line
        x1={start.x}
        y1={start.y}
        x2={dartEndX}
        y2={dartEndY}
        stroke={stroke}
        strokeWidth={(isHovered || highlight != '') ? "14" : "2"}
        
      />
      <polygon
        points={(isHovered || highlight != '') ? "0,-12 16,0 0,12" : "0,-4 10,0 0,4"}
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
        fontSize="14"
        fontWeight="bold"
      >
        {dart.index}{dart.removed ? 'r' : ''}
      </text>
    </g>
  );
};

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
        stroke="black"
        strokeWidth="1"
        paintOrder="stroke"
        fontSize="16"
        fontWeight="bold"
      >
        {index}
      </text>
    </g>
  );
};

interface LineProps {
  start: Vector;
  end: Vector;
  stroke: string;
  strokeWidth: number;
}

export const Line: React.FC<LineProps> = ({ start, end, stroke, strokeWidth }) => {
  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

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