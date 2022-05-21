import React from 'react';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';

export interface ContainerProps {
  children?: React.ReactElement | React.ReactElement[];
  className?: string;
}

const StylesContainer = styled.div`
  position: relative;
  max-width: var(--width, 1400px);
  margin: 0 auto;

  @media ${breakPoints.xl} {
    --width: 1024px;
  }

  @media ${breakPoints.lg} {
    --width: 830px;
  }

  @media ${breakPoints.md} {
    --width: 580px;
  }

  @media ${breakPoints.sm} {
    --width: 300px;
  }
`;

const Container = (props: ContainerProps): React.ReactElement => {
  const { children, className } = props;
  return <StylesContainer className={className}>{children}</StylesContainer>;
};

export default Container;
