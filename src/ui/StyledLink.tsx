import React from 'react';
import styled from '@emotion/styled';

interface StyledLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const StyledAnchor = styled.a`
  color: #2a7597;
  text-decoration: underline;

  &:hover {
    color: #195773;
  }
`;

const StyledLink: React.FC<StyledLinkProps> = ({ 
  href, 
  children, 
  ...props 
}) => {
  return (
    <StyledAnchor
      href={href}
      {...props}
    >
      {children}
    </StyledAnchor>
  );
};

export default StyledLink;