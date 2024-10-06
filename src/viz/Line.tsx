import { Vector } from '../math/vector';

interface LineProps {
  start: Vector;
  end: Vector;
  stroke: string;
  strokeWidth: number;
}

export const Line = ({ start, end, stroke, strokeWidth }: LineProps) => {
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