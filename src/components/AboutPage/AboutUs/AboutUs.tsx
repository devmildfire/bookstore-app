import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
import Books from './Books';
import Button from '@/components/Common/Button';

const StyledDescriptionContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1440px;
  padding-top: 120px;
  gap: var(--containerMarginBottom);
  --containerMarginBottom: 45px;

  @media ${breakPoints.xl} {
    --containerMarginBottom: 40px;
  }

  @media ${breakPoints.sm} {
    --containerMarginBottom: 15px;
  }
`;

const StyledButton = styled(Button)`
  width: 480px;
`;

const StyledDescription = styled(Text)`
  max-width: 760px;
`;

const StyledSection = styled('section')`
  margin-top: 150px;
  width: 100%;
`;

const AboutUs = () => (
  <StyledSection>
    <Container>
      <Text align='center' variant='h2_1'>
        О чем мы?
      </Text>
    </Container>
    <Books />
    <StyledDescriptionContainer>
      <StyledDescription variant='text'>
        Независимое издательство Чтиво — дитя петербургского литандеграунда и
        сети интернет, увидевшее свет в 2017 году. Мы отбираем вещи для издания
        вне зависимости от известности автора, работаем с несерийными и
        неформальными произведениями и считаем, что книгоиздание не должно быть
        бизнесом.
      </StyledDescription>
      <StyledButton>Манифест Чтива</StyledButton>
    </StyledDescriptionContainer>
  </StyledSection>
);

export default AboutUs;
