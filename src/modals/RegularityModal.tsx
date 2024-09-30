import { Modal, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import styled from '@emotion/styled';
import { Vector } from '../vector';
import { ChiShapeComputer } from '../chiShape';
import DelaunayTriangulation from '../viz/DelaunayTriangulation';
import Polygon from '../viz/Polygon';
import Colors from '../Colors';
import { Vertex } from '../Vertex';
import EdgeSymbol from '../ui/EdgeSymbol';

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SVGContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48%; // This ensures equal spacing
`;

const SVGTitle = styled.div`
  font-weight: 700;
  margin-top: 8px;
`;

interface RegularityModalProps {
  opened: boolean;
  onClose: () => void;
}

function RegularityModal({ opened, onClose }: RegularityModalProps) {
  const irregularPoints = useMemo(() => [
    new Vector(30, 30),
    new Vector(270, 30),
    new Vector(270, 270),
    new Vector(30, 270)
  ], []);

  const regularPoints = useMemo(() => [
    new Vector(30, 30),
    new Vector(270, 30),
    new Vector(270, 270),
    new Vector(30, 270),
    new Vector(150, 150)
  ], []);

  const irregularComputer = useMemo(() => new ChiShapeComputer(irregularPoints, 1), [irregularPoints]);
  const regularComputer = useMemo(() => new ChiShapeComputer(regularPoints, 1), [regularPoints]);

  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Regularity</Title>} size="xl" padding={40}>
      <Text mb="md">
        The removal of an edge is "regular" if the edge's opposing vertex is an interior vertex, e.g.
        not connected to any boundary edges.
      </Text>
      <Text mb="md">
        Consider the edge <EdgeSymbol vertex1={0} vertex2={1}/> in both configurations. In the irregular
        setup, the opposite vertex is 2, which is NOT an interior vertex. Removing this edge would thus create an
        irregular triangulation in which vertex 1 would be left dangling.
      </Text>
      <Text mb="md">
        In the regular setup, the opposite vertex is 4, which is an interior vertex. Removing this edge will leave
        us with a regular triangulation.
      </Text>
      <FlexContainer>
        <SVGContainer>
          <SVGTitle>Irregular</SVGTitle>
          <svg width={300} height={300}>
            <Polygon 
              points={irregularPoints}
              fill={Colors.lightPurple}
              stroke={Colors.purple}
              strokeWidth={10}
            />
            <line
              x1={30}
              y1={30}
              x2={270}
              y2={30}
              stroke={Colors.lightYellow}
              strokeWidth={10}
            />            
            <DelaunayTriangulation 
              combinatorialMap={irregularComputer.getCombinatorialMap()} 
              points={irregularPoints}
            />
            {irregularPoints.map((point, index) => (
              <Vertex
                key={index}
                point={point}
                index={index}
                strokeColor={Colors.purple}
                textColor="white"
              />
            ))}
          </svg>
        </SVGContainer>
        <SVGContainer>
          <SVGTitle>Regular</SVGTitle>
          <svg width={300} height={300}>
            <Polygon 
              points={regularPoints.filter(v => v.x != 150 && v.y != 150)}
              fill={Colors.lightPurple}
              stroke={Colors.purple}
              strokeWidth={10}
            />
            <line
              x1={30}
              y1={30}
              x2={270}
              y2={30}
              stroke={Colors.lightRed}
              strokeWidth={10}
            />
            <DelaunayTriangulation 
              combinatorialMap={regularComputer.getCombinatorialMap()} 
              points={regularPoints}
            />
            {regularPoints.map((point, index) => (
              <Vertex
                key={index}
                point={point}
                index={index}
                strokeColor={Colors.purple}
                textColor="white"
              />
            ))}
          </svg>
        </SVGContainer>
      </FlexContainer>
    </Modal>
  );
}

export default RegularityModal;