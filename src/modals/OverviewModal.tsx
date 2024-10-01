import { Modal, Text, Title } from '@mantine/core';
import styled from '@emotion/styled';

const FlexContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

interface OverviewModalProps {
  opened: boolean;
  onClose: () => void;
}

function OverviewModal({ opened, onClose }: OverviewModalProps) {
  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Chi Shape Algorithm</Title>} size="xl" padding={40}>
      <Text mb="md">
        The Chi Shape Algorithm is a an algorithm developed by Matt Duckham, Lars Kulik, Mike Worboys, and Antony Galton. It is an algorithm for the
        "efficient generation of simple polygons for characterizing the shape of a set of points."
      </Text>
      <Text mb="md">
        In other words, it lets us find a perimeter containing a set of points that is much tighter than a simple convex hull. Additionally, it provides
        us with a parameter <span>λ<sub>p</sub></span> that represents how tightly the perimeter should fit.
      </Text>
      <Text mb="md">
        The original paper detailing the algorithm can be found <a href="https://www.geosensor.net/papers/duckham08.PR.pdf" target="_blank">here</a>.
      </Text>
    </Modal>
  );
}

export default OverviewModal;