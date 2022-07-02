import React from 'react';
import styled from 'styled-components';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
import PartnersList from './PartnersLIst';

const StyledContainer = styled(Container)`
  display: grid;
  gap: 70px;
  justify-content: center;
`;

const Partners = (): React.ReactElement => (
  <StyledContainer>
    <Text variant='h2' align='center'>
      Наши партнеры
    </Text>
    <PartnersList />
  </StyledContainer>
);

export default Partners;
