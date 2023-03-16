import React from 'react';
import Text from '@/components/Common/Text';
import DonateForm from './DonateForm';
import StyledWrapper from './styles';

const Donate = (): React.ReactElement => (
  <StyledWrapper>
    <Text variant='h2_1' align='center'>
      Задонатить Чтиву
    </Text>
    <DonateForm />
  </StyledWrapper>
);

export default Donate;
