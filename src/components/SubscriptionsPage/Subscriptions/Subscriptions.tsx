import * as React from 'react';
import Text from '@/components/Common/Text';
import { StyledWrapper, StyledTextWrapper } from './styles';
import SubscriptionsList from './SubscriptionsList';
import Container from '@/components/Common/Container';

const Subscriptions: React.FC = () => (
  <Container>
    <StyledWrapper>
      <StyledTextWrapper>
        <Text
          variant='h3_3'
          component='p'
          textTransform='none'
          fontWeight={400}
          align='center'
        >
          Красиво и просто, как в сказке: деньги ежемесячно снимаются с вашей
          карты (надоест - отключим), а вам тем временем приходят все наши новые
          уникальные издания, теперь об этом можно не только мечтать.
        </Text>
      </StyledTextWrapper>
      <SubscriptionsList />
    </StyledWrapper>
  </Container>
);

export default React.memo(Subscriptions);
