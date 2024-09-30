import React from 'react';
import styled from '@emotion/styled';

interface ColorLabelProps {
  backgroundColor: string;
  children: React.ReactNode;
}

const LabelSpan = styled.span<{ backgroundColor: string }>`
  display: inline-block;
  background-color: ${props => props.backgroundColor};
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 6px;
  text-align: center;
  width: 80px;
  transition: background-color 300ms linear;
`;

const ColorLabel = ({ backgroundColor, children }: ColorLabelProps) => {
  return (
    <LabelSpan backgroundColor={backgroundColor}>
      {children}
    </LabelSpan>
  );
};

export default ColorLabel;