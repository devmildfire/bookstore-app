import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Text from '@/components/Common/Text';
import Members from './Members';

const StyledWrapper = styled.div`
  display: grid;
  gap: 70px;

  padding-top: 125px;

  @media ${breakPoints.xl} {
    padding-top: 105px;
  }

  @media ${breakPoints.lg} {
    padding-top: 60px;

    gap: 60px;
  }

  @media ${breakPoints.sm} {
    padding-top: 0;

    gap: 30px;
  }
`;

const We = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Мы
    </Text>
    <Members />
  </StyledWrapper>
);

export default We;
