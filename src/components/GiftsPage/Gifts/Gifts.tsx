import * as React from 'react';
import Text from '@/components/Common/Text';
import { StyledTextBlock, StyledWrapper } from './styles';
import Container from '@/components/Common/Container';
import GiftsList from './GiftsList';

const phrases: string[] = [
  'Подарите себе и ближнему лучшую современную литературу. Получите безграничное признание сообщества инди-книгоиздания.',
  'Виртуальные карты, которые позволят вашему другу в любое время заказать любое издание Чтива. Номинал не сгорает, пока мы работаем, подводных камней вообще никаких, даже объяснять нечего — идеальные дары и всё тут.',
];

const Gifts: React.FC = () => (
  <Container>
    <StyledWrapper>
      <StyledTextBlock>
        {phrases.map((phrase) => (
          <Text variant='text' key={phrase} align='center'>
            {phrase}
          </Text>
        ))}
      </StyledTextBlock>

      <GiftsList />
    </StyledWrapper>
  </Container>
);

export default React.memo(Gifts);
