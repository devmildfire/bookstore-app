import React from 'react';
import Text from '../../Common/Text';
import StyledWrapper from './styles';
import SubscribeForm from './SubscribeForm';

const BeWithUs = (): React.ReactElement => (
  <StyledWrapper>
    <Text
      component='h2'
      fontFamily='serif'
      align='center'
      textTransform='uppercase'
    >
      Будьте с нами
    </Text>
    <SubscribeForm />
  </StyledWrapper>
);

export default BeWithUs;
