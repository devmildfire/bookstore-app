import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
import Books from './Books';
import Button from '@/components/Common/Button';

// const StyledDescriptionContainer = styled.div`
const StyledDescriptionContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1440px;
  padding-top: 31px;
  gap: var(--containerMarginBottom);
  --containerMarginBottom: 45px;

  @media ${breakPoints.xl} {
    --containerMarginBottom: 40px;
    padding-top: 17px;
  }

  @media ${breakPoints.lg} {
    padding-top: 17px;
  }

  @media ${breakPoints.md} {
    width: var(--width);
    flex-direction: column;
    padding-top: 18px;
  }

  @media ${breakPoints.sm} {
    --width: 294px;
    margin: auto;
    --containerMarginBottom: 15px;
  }
`;

const StyledButton = styled(Button)`
  /* width: 480px; */
  width: calc(min(480px, var(--width)));
`;

const StyledDescription = styled(Text)`
  max-width: 780px;
`;

const StyledSection = styled('section')`
  margin-top: 0px;
  /* margin-top: 160px; */
  width: 100%;

  /* @media ${breakPoints.xl} {

  }

  @media ${breakPoints.lg} {

  }

  @media ${breakPoints.md} {

  }

  @media ${breakPoints.sm} {

  } */
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
        <p>
          Независимое издательство Чтиво — дитя петербургского литандеграунда и
          сети интернет, увидевшее свет в 2017 году.
        </p>
        <p>
          Мы отбираем вещи для издания вне зависимости от известности автора,
          работаем с несерийными и неформальными произведениями и считаем, что
          книгоиздание не должно быть бизнесом.
        </p>
      </StyledDescription>
      <StyledButton variant='small'>Манифест Чтива</StyledButton>
    </StyledDescriptionContainer>
  </StyledSection>
);

export default AboutUs;
