import React from 'react';
import { Vector } from '../math/vector';

interface DashedArcProps {
  start: Vector;
  end: Vector;
  center: Vector;
  stroke: string;
  strokeWidth: number;
  dashArray?: string;
  label?: string;
  labelColor?: string;
}

export function DashedArc({ 
  start, 
  end, 
  center,
  stroke, 
  strokeWidth, 
  dashArray = "5,5",
  label,
  labelColor = "#4A4A4A" // assuming this is your dark gray color
}: DashedArcProps) {
  // Calculate radius
  const radius = Math.sqrt(
    (center.x - start.x) ** 2 + (center.y - start.y) ** 2
  );

  // Calculate angles
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x);

  // Ensure counter-clockwise direction
  let deltaAngle = endAngle - startAngle;
  if (deltaAngle <= 0) deltaAngle += 2 * Math.PI;
  
  // Large arc flag is 1 if angle > 180 degrees
  const largeArcFlag = deltaAngle > Math.PI ? 1 : 0;
  
  // Sweep flag is always 1 for counter-clockwise
  const sweepFlag = 1;

  // Create the SVG arc path
  const path = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;

  // Calculate midpoint of the arc for label placement
  const midAngle = startAngle + deltaAngle / 2;
  const labelX = center.x + radius * Math.cos(midAngle);
  const labelY = center.y + radius * Math.sin(midAngle);

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
      />
      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill={labelColor}
          stroke='white'
          strokeWidth={3}
          paintOrder="stroke"
          pointerEvents="none"
        >
          {label}
        </text>
      )}
    </>
  );
}