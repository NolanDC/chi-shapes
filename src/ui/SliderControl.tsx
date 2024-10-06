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
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
  }  
`;

const SliderWrapper = styled.div`
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;
`;

const ControlsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 20px;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  max-width: 400px;
  justify-content: center;

`;

const LeftButtonGroup = styled(ButtonGroup)`
  justify-content: space-between;
  @media (max-width: 600px) {
    justify-content: flex-end;
  }
`;

const RightButtonGroup = styled(ButtonGroup)`
  @media (max-width: 600px) {
    justify-content: flex-start;
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 5px;

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
  font-size: 16px;
  font-weight: bold;
  margin: 0 10px;

  @media (min-width: 600px) {
    margin: 0 50px;
  }
`;

interface SliderControlProps {
  stepIndex: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
}

const SliderControl = ({ stepIndex, totalSteps, onStepChange }: SliderControlProps) => {
  return (
    <SliderContainer>
      <InteractionContainer>
        <SliderWrapper>
          <Slider
            value={stepIndex}
            onChange={onStepChange}
            min={0}
            max={totalSteps - 1}
            style={{ width: '100%' }}
          />
        </SliderWrapper>
        <ControlsWrapper>
          <LeftButtonGroup>
            <IconButton onClick={() => onStepChange(0)}>
              <ChevronsLeft size={24} />
            </IconButton>
            <IconButton onClick={() => onStepChange(stepIndex - 1)} disabled={stepIndex === 0}>
              <ChevronLeft size={24} />
            </IconButton>
          </LeftButtonGroup>
          <StepCount>
            {stepIndex + 1} / {totalSteps}
          </StepCount>
          <RightButtonGroup>
            <IconButton onClick={() => onStepChange(stepIndex + 1)} disabled={stepIndex === totalSteps - 1}>
              <ChevronRight size={24} />
            </IconButton>
            <IconButton onClick={() => onStepChange(totalSteps - 1)}>
              <ChevronsRight size={24} />
            </IconButton>
          </RightButtonGroup>
        </ControlsWrapper>
      </InteractionContainer>
    </SliderContainer>
  );
};

export default SliderControl;