import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';

export interface ContainerProps {
  className?: string;
}

const StylesContainer = styled.div`
  --width: 1400px;
  position: relative;
  max-width: var(--width);
  width: 100%;
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

const Container = (
  props: PropsWithChildren<ContainerProps>,
): React.ReactElement => {
  const { children, className } = props;
  return <StylesContainer className={className}>{children}</StylesContainer>;
};

export default Container;
