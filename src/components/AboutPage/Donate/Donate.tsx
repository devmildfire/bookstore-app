import React from 'react';
import StyledDonateText from './styles';

const Donate = (): React.ReactElement => (
  <StyledDonateText
    component='h2'
    fontFamily='serif'
    align='center'
    textTransform='uppercase'
  >
    Задонатить Чтиву
  </StyledDonateText>
);

export default Donate;
