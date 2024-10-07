import styled from '@emotion/styled';
import { Modal, Text, Title } from '@mantine/core';
import StyledLink from '../ui/StyledLink';

interface OverviewModalProps {
  opened: boolean;
  onClose: () => void;
}

const AlgorithmList = styled.ul`
  list-style-type: decimal;
  font-style: italic;
  ul {
    list-style-type: lower-latin;
  }
  
  background: #f2f2f2;
  border-radius: 4px;
  padding: 10px 30px;
`

function OverviewModal({ opened, onClose }: OverviewModalProps) {
  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Chi Shape Algorithm</Title>} size="xl" padding={30}>
      <Text mb="sm">
        The Chi Shape Algorithm is a an algorithm developed by Matt Duckham, Lars Kulik, Mike Worboys, and Antony Galton. It is an algorithm for the
        "efficient generation of simple polygons for characterizing the shape of a set of points."
      </Text>
      <Text mb="sm"> 
        In other words, it lets us find a perimeter containing a set of points that is much tighter than a simple convex hull. Additionally, it provides
        us with a parameter <span>λ<sub>p</sub></span> that represents how tightly the perimeter should fit.
      </Text>
      <Text mb="sm">
        A simplified description of the algorithm is as follows:
        <AlgorithmList>
          <li>Compute the <StyledLink target='_blank' href="https://en.wikipedia.org/wiki/Delaunay_triangulation">Delaunay Triangulation</StyledLink> for the set of points</li>
          <li>
            Loop through a list of boundary edges, sorted in order of descending length
            <ul>
              <li>Remove the edge if its length is greater than our threshold (parameterized by <span>λ<sub>p</sub></span>) and removing it would leave us
                with a simple connected polygon
              </li>
              <li>Add the newly revealed edges to our sorted list of boundary edges</li>
            </ul>            
          </li>
        </AlgorithmList>
      </Text>
      <Text mb="sm">
        The original paper detailing the algorithm can be found <StyledLink href="https://www.geosensor.net/papers/duckham08.PR.pdf" target="_blank">here</StyledLink>.
      </Text>
    </Modal>
  );
}

export default OverviewModal;