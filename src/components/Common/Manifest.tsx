import React from 'react';
import styled from 'styled-components';
import { ClassNameProps } from '../../types/className';
import Text from './Text';
import ArrowIcon from '../../assets/images/arrow.svg';
import breakPoints from '../../utils/breakPoints';

const StyledWrapper = styled.span`
  position: relative;

  color: #930000;
  fill: #930000;
`;

const StyledArrowIcon = styled(ArrowIcon)`
  --gap: 8px;
  position: absolute;
  left: 0;
  top: calc(100% + var(--gap));

  width: 100%;

  @media ${breakPoints.lg} {
    --gap: 2px;
  }
`;

const Manifest = (props: ClassNameProps): React.ReactElement => {
  const { className } = props;

  return (
    <StyledWrapper className={className}>
      <Text variant='p'>
        <a href='fakePath'>&#171;Манифесте Чтива&#187;</a>
      </Text>
      <StyledArrowIcon />
    </StyledWrapper>
  );
};

export default Manifest;
