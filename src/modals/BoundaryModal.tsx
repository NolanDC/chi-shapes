import { Modal, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import styled from '@emotion/styled';
import { Vector } from '../math/vector';
import { ChiShapeComputer } from '../math/ChiShapeComputer';
import DelaunayTriangulation from '../viz/DelaunayTriangulation';
import Polygon from '../viz/Polygon';
import Colors from '../Colors';
import { Vertex } from '../viz/Vertex';
import EdgeSymbol from '../ui/EdgeSymbol';

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SVGContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SVGTitle = styled.div`
  font-weight: 700;
  margin-top: 8px;
`;

interface BoundaryModalProps {
  opened: boolean;
  onClose: () => void;
}

function BoundaryModal({ opened, onClose }: BoundaryModalProps) {

  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Boundary Edges</Title>} size="xl" padding={40}>
      <Text mb="sm">
        It's easy to tell whether an edge is a boundary edge by just looking at it, but programatically it's not as easy to figure out.
        The algorithm relies on constructing a <a href="https://en.wikipedia.org/wiki/Combinatorial_map" target="_blank">combinatorial map</a> containing a
        set of darts, which are essentialy half-edges protruding from a vertex. This map defines a couple of functions:
      </Text>
      <Text mb="sm">
        <div>
          &theta;<sub>0</sub>(<i>d</i>) returns the dart opposite of our specified dart <i>d</i>
        </div>
        <div>
          &theta;<sub>1</sub>(d) returns the next dart that is counterclockwise from <i>d</i> around <i>d'</i>s vertex.
        </div>
      </Text>
      <Text mb="sm">
        We can use these functions to "walk" around in a triangle starting from a dart, using the function:
        <i>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>(d)</i>
      </Text>
      <Text mb="sm">
        If the resulting dart is the same as <i>d</i>, we have successfully navigated around a triangle that is located counter-clockwise of <i>d</i>. 

        If we do the same for the other other dart in our edge, that means that there is a closed triangle on both sides of the edge. Thus, it is not a boundary edge.
      </Text>
      <FlexContainer>
        <SVGContainer>

        </SVGContainer>
      </FlexContainer>
    </Modal>
  );
}

export default BoundaryModal;