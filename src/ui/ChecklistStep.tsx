import React from 'react';
import { CircleCheck, Circle } from 'lucide-react';
import styled from '@emotion/styled';

interface ChecklistStepProps {
  checked: boolean;
  children: React.ReactNode;
}

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const IconWrapper = styled.div<{ checked: boolean }>`
  color: ${props => props.checked ? '#10B981' : '#aaa'};
    transition: color 300ms linear;
  flex-shrink: 0;

  svg {
    width: 20px;
    vertical-align: bottom;
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
`;

const ChecklistStep = ({ checked, children }: ChecklistStepProps) => {
  return (
    <StepContainer>
      <IconWrapper checked={checked}>
        {checked ? <CircleCheck size={24} /> : <Circle size={24} />}
      </IconWrapper>
      <ContentWrapper>{children}</ContentWrapper>
    </StepContainer>
  );
};

export default ChecklistStep;