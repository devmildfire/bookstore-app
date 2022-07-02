import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
import WithArrow from '@/components/Common/WithArrow';
import Books from './Books';

const StyledDescriptionContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: var(--containerMarginBottom);
  --containerMarginBottom: 45px;

  @media ${breakPoints.xl} {
    --containerMarginBottom: 40px;
  }

  @media ${breakPoints.sm} {
    --containerMarginBottom: 15px;
  }
`;

const StyledManifestText = styled(Text)`
  margin-left: auto;
`;

const AboutUs = () => (
  <section>
    <Container>
      <Text align='center' variant='h2'>
        О чем мы?
      </Text>
    </Container>
    <Books />
    <StyledDescriptionContainer>
      <Text variant='p'>
        <Text component='span' variant='h2' fontFamily='serif'>
          Н
        </Text>
        езависимое издательство Чтиво — дитя петербургского литандеграунда и
        сети интернет, увидевшее свет в 2017 году. Мы отбираем вещи для издания
        вне зависимости от известности автора, работаем с несерийными и
        неформальными произведениями и считаем, что книгоиздание не должно быть
        бизнесом.
      </Text>
      <StyledManifestText variant='p' component='span'>
        Узнать больше в &nbsp;
        <WithArrow color='red' variant='p' component='span'>
          «Манифесте Чтива»
        </WithArrow>
      </StyledManifestText>
    </StyledDescriptionContainer>
  </section>
);

export default AboutUs;
