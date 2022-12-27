import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import PartnersList from './PartnersLIst';
import breakPoints from '@/utils/breakPoints';

const StyledContainer = styled.div`
  display: grid;
  gap: 80px;
  justify-content: center;

  @media ${breakPoints.xl} {
    gap: 64px;
  }

  @media ${breakPoints.lg} {
    gap: 80px;
  }

  @media ${breakPoints.sm} {
    gap: 30px;
  }
`;

const Partners = (): React.ReactElement => (
  <StyledContainer>
    <Text variant='h2_1' align='center'>
      Наши партнёры
    </Text>
    <PartnersList />
  </StyledContainer>
);

export default Partners;
