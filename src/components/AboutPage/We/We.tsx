import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Members from './Members';
import Text from '@/components/Common/Text';

const StyledWrapper = styled.div`
  @media ${breakPoints.xl} {
    padding-top: 105px;
  }

  @media ${breakPoints.lg} {
    padding-top: 60px;
  }

  @media ${breakPoints.sm} {
    padding-top: 0;
  }
`;

const StyledTitle = styled(Text)`
  position: relative;
  margin: 0;
  padding-bottom: 83px;
  z-index: 2;

  @media ${breakPoints.xl} {
    padding-bottom: 96px;
  }

  @media ${breakPoints.lg} {
    padding-bottom: 60px;
  }

  @media ${breakPoints.sm} {
    padding-bottom: 30px;
  }
`;

const We = (): React.ReactElement => (
  <StyledWrapper>
    <StyledTitle variant='h2_1' align='center'>
      Мы
    </StyledTitle>
    <Members />
  </StyledWrapper>
);

export default We;
