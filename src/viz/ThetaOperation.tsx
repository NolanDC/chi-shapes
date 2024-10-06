import React from 'react';
import Colors from '../Colors';

interface ThetaOperationProps {
  x: number;
  y: number;
  type: '0' | '1';
}

export const ThetaOperation: React.FC<ThetaOperationProps> = ({ x, y, type}) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="14"
      fill={Colors.darkGray}
      stroke='white'
      strokeWidth={3}
      paintOrder="stroke"
      pointerEvents="none"
    >
      θ{type === '0' ? '₀' : '₁'}
    </text>
  );
};