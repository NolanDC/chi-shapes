import { Modal, Text, Title } from '@mantine/core';
import styled from '@emotion/styled';
import BoundaryEdgeSVGs from './BoundaryEdgeSVGs';

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

const FunctionDescriptions = styled.div`
  background: #f2f2f2;
  padding: 15px;
  border-radius: 4px;
`

const InstructionsText = styled.div`
  font-style: italic;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`

interface BoundaryModalProps {
  opened: boolean;
  onClose: () => void;
}

function BoundaryModal({ opened, onClose }: BoundaryModalProps) {

  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Boundary Edges</Title>} size="xl" padding={30}>
      <Text mb="sm">
        It's easy to tell whether an edge is a boundary edge by just looking at it, but programatically it's not quite so easy.
        The algorithm relies on constructing a <a style={{color:'#2a7597'}} href="https://en.wikipedia.org/wiki/Combinatorial_map" target="_blank">combinatorial map</a> containing a
        set of darts, which are essentialy half-edges protruding from a vertex. This map defines a couple of functions:
      </Text>
      <Text mb="sm">
        <FunctionDescriptions>
          <div>
            &theta;<sub>0</sub>(<i>d</i>) returns the dart opposite of our specified dart <i>d</i>
          </div>
          <div>
            &theta;<sub>1</sub>(d) returns the next dart that is counterclockwise from <i>d</i> around <i>d'</i>s vertex.
          </div>
        </FunctionDescriptions>
      </Text>
      <Text mb="sm">
        We can use these functions to "walk" around in a triangle starting from a dart, using the function:
        <i>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>(d)</i>
      </Text>
      <Text mb="sm">
        If the resulting dart is the same as <i>d</i>, we have successfully navigated around a triangle that is located counter-clockwise of <i>d</i>. 

        If we do the same for the other other dart in our edge, that means that there is a closed triangle on both sides of the edge. Thus, it is not a boundary edge.
        <br/>
      </Text>
      <BoundaryEdgeSVGs/>
      <InstructionsText>
        <i>Hover over the darts to see all darts along the boundary walk.</i>
      </InstructionsText>

    </Modal>
  );
}

export default BoundaryModal;