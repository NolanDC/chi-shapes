import styled from '@emotion/styled';
import { Modal, Text, Title } from '@mantine/core';

interface LambdaModalProps {
  opened: boolean;
  onClose: () => void;
}

function LambdaModal({ opened, onClose }: LambdaModalProps) {
  return (
    <Modal centered opened={opened} onClose={onClose} title={<Title size={'h2'}>Parameter: <span>λ<sub>p</sub></span></Title>} size="xl" padding={30}>
      <Text>
        <span>λ<sub>p</sub></span> controls the length threshold used to determine
        which edges to remove. 
        <br/>
        <span>λ<sub>p</sub></span> = 0 means that all edges that can be removed
        will be.
        <br/>
        <span>λ<sub>p</sub></span> = 1 means no edges will be removed.
      </Text>
    </Modal>
  );
}

export default LambdaModal;