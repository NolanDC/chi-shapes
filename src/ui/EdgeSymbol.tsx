import React from 'react';
import { Vertex } from '../viz/Vertex';
import { Line } from '../viz/Line';
import { Vector } from '../math/vector';
import styled from '@emotion/styled';
import Colors from '../Colors';

interface EdgeSymbolProps {
  vertex1: number;
  vertex2: number;
}

const VertexSVG = styled.svg`
  display: inline;
  vertical-align: bottom;
`

const EdgeSymbol: React.FC<EdgeSymbolProps> = ({ vertex1, vertex2 }) => {
  const svgWidth = 120;
  const svgHeight = 30;
  const padding = 20;

  const point1 = new Vector(padding, svgHeight / 2);
  const point2 = new Vector(svgWidth - padding, svgHeight / 2);

  return (
    <VertexSVG width={svgWidth} height={svgHeight}>
      <Line
        start={point1}
        end={point2}
        stroke={Colors.purple}
        strokeWidth={6}
      />
      <Vertex
        point={point1}
        index={vertex1}
        color="#50434f"
        textColor="white"
        strokeColor={Colors.purple}
      />
      <Vertex
        point={point2}
        index={vertex2}
        color="#50434f"
        textColor="white"
        strokeColor={Colors.purple}
      />
    </VertexSVG>
  );
};

export default EdgeSymbol;