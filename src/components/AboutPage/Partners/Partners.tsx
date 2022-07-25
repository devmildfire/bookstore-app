import React from 'react';
import styled from 'styled-components';
import Text from '@/components/Common/Text';
import PartnersList from './PartnersLIst';

const StyledContainer = styled.div`
  display: grid;
  gap: 70px;
  justify-content: center;
`;

const Partners = (): React.ReactElement => (
  <StyledContainer>
    <Text variant='h2_1' align='center'>
      Наши партнеры
    </Text>
    <PartnersList />
  </StyledContainer>
);

export default Partners;
