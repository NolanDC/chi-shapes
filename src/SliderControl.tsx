import React from 'react';
import styled from '@emotion/styled';
import { Slider } from '@mantine/core';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

const SliderContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-bottom: 40px;
  align-items: center;
`;

const InteractionContainer = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  padding: 0 60px;
  justify-content: space-between;
  align-items: center;
`

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;

  &:hover {
    color: #007bff;
  }
  &:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
`;

const StepCount = styled.div`
  color: gray;
`

interface SliderControlProps {
  stepIndex: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({ stepIndex, totalSteps, onStepChange }) => {
  return (
    <SliderContainer>
      <InteractionContainer>
        <IconButton onClick={() => onStepChange(0)}>
          <ChevronsLeft size={24} />
        </IconButton>
        <IconButton onClick={() => onStepChange(stepIndex - 1)} disabled={stepIndex === 0}>
          <ChevronLeft size={24} />
        </IconButton>
        <Slider
          value={stepIndex}
          onChange={onStepChange}
          min={0}
          max={totalSteps - 1}
          style={{ width: '100%' }}
        />        
        <IconButton onClick={() => onStepChange(stepIndex + 1)} disabled={stepIndex === totalSteps - 1}>
          <ChevronRight size={24} />
        </IconButton>
        <IconButton onClick={() => onStepChange(totalSteps - 1)}>
          <ChevronsRight size={24} />
        </IconButton>
      </InteractionContainer>
      <StepCount>
      </StepCount>
        {stepIndex+1} / {totalSteps}
    </SliderContainer>
  );
};

export default SliderControl;