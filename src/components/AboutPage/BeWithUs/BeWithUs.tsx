import React from 'react';
import Text from '@/components/Common/Text';
import StyledWrapper from './styles';
import SubscribeForm from './SubscribeForm';

const BeWithUs = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Будьте с нами
    </Text>
    <SubscribeForm />
  </StyledWrapper>
);

export default BeWithUs;
