import { Modal, Text, Title } from '@mantine/core';
import styled from '@emotion/styled';
import BoundaryEdgeSVGs from './BoundaryEdgeSVGs';

const FunctionDescriptions = styled.div`
  background: #f2f2f2;
  padding: 10px 15px;
  border-radius: 4px;
`

const Function = styled.span`
  background: #f2f2f2;
  display: inline-block;
  padding: 0px 4px;
  margin: 0 8px;
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
        The algorithm relies on constructing a <a style={{color:'#2a7597'}} href="https://en.wikipedia.org/wiki/Combinatorial_map" target="_blank">combinatorial map</a> containing a
        set of darts, which are essentially half-edges protruding from a vertex. This map defines a couple of functions:
      </Text>
      <Text mb="sm">
        <FunctionDescriptions>
          <div>
            &theta;<sub>0</sub>(<i>d</i>) returns the dart opposite <i>d</i>, on the same edge
          </div>
          <div>
            &theta;<sub>1</sub>(d) returns the next dart that is counterclockwise from <i>d</i> around <i>d'</i>s vertex.
          </div>
        </FunctionDescriptions>
      </Text>
      <Text mb="sm">
        We can use &theta;<sub>0</sub> and &theta;<sub>1</sub> to navigate around our graph, using the function:
        <Function>
          <i>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>&theta;<sub>0</sub>&theta;<sub>1</sub>(d)</i>
        </Function>
      </Text>
      <Text mb="sm">
        If the result of this function is <i>d</i> itself, we have fully navigated around a triangle that is located counter-clockwise of <i>d</i>. 

        If the same holds true for the other dart in the edge, that means that there is a closed triangle on both sides, and thus it is an interior edge. Otherwise, it is a boundary edge.
        <br/>
      </Text>
      <BoundaryEdgeSVGs/>
      <InstructionsText>
        <i>Click a dart on the highlighted edge to see all darts along the boundary walk.</i>
      </InstructionsText>
    </Modal>
  );
}

export default BoundaryModal;