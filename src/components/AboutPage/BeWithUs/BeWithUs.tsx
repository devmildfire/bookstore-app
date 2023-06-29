import React from 'react';
import Text from '@/components/Common/Text';
import StyledWrapper from './styles';
import SubscribeForm from './SubscribeForm';

const BeWithUs = (): React.ReactElement => (
  <StyledWrapper>
    <div>
      <Text variant='h2_1' align='center'>
        Будьте с нами
      </Text>
      <Text variant='manRec' align='center'>
        Подпишитесь на письма Чтива
      </Text>
    </div>
    <SubscribeForm />
  </StyledWrapper>
);

export default BeWithUs;
