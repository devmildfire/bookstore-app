import React from 'react';
import styled from 'styled-components';
import breakPoints from '../../../utils/breakPoints';
import Text from '../../Common/Text';
import Members from './Members';

const StyledWrapper = styled.section`
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
    <Text component='h2' align='center' fontFamily='serif'>
      Мы
    </Text>
    <Members />
  </StyledWrapper>
);

export default We;
