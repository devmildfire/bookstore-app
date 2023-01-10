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
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 1440px;
  padding-top: 31px;
  /* gap: var(--containerMarginBottom); */
  gap: var(--containerGap);
  --containerMarginBottom: 45px;
  --containerGap: 26px;

  @media ${breakPoints.xl} {
    --containerMarginBottom: 40px;
    padding-top: 17px;
  }

  @media ${breakPoints.lg} {
    padding-top: 17px;
    flex-direction: column;
    --containerGap: 26px;
  }

  @media ${breakPoints.md} {
    width: var(--width);
    /* flex-direction: column; */
    padding-top: 18px;
  }

  @media ${breakPoints.smd} {
    width: var(--width);
    flex-direction: column;
    padding-top: 18px;
    --containerGap: 26px;
  }

  @media ${breakPoints.sm} {
    --width: 285px;
    flex-direction: column;
    margin: auto;
    --containerMarginBottom: 15px;
    --containerGap: 26px;
  }

  > div {
    display: flex;
    flex-direction: row;
    gap: 20px;
    width: var(--width);
    justify-content: space-between;

    @media ${breakPoints.sm} {
      flex-direction: column;
      gap: 26px;
    }
  }
`;

const StyledButton = styled(Button)`
  /* width: 480px; */
  width: calc(min(480px, var(--width)));
  max-height: 62px;
  min-height: 62px;
  margin-top: auto;
  min-width: 480px;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
    max-height: 45px;
    min-height: 45px;
    margin-top: auto;
    min-width: 300px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    max-height: 32px;
    min-height: 32px;
    margin-top: auto;
    min-width: 286px;
  }

  @media ${breakPoints.sm} {
  }
`;

const StyledDescription = styled(Text)`
  max-width: 750px;

  @media ${breakPoints.xl} {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    /* max-width: 400px; */
  }

  @media ${breakPoints.sm} {
  }
`;

const StyledDescriptionTop = styled(Text)`
  max-width: 750px;

  @media ${breakPoints.xl} {
    max-width: 550px;
  }

  @media ${breakPoints.lg} {
    max-width: 550px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    max-width: 450px;
  }

  @media ${breakPoints.sm} {
  }
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
        О чём мы?
      </Text>
    </Container>
    <Books />
    <StyledDescriptionContainer>
      <StyledDescriptionTop variant='aboutText'>
        <p>
          Независимое издательство Чтиво — дитя петербургского литандеграунда и
          сети интернет, увидевшее свет в 2017 году.
        </p>
      </StyledDescriptionTop>
      <div>
        <StyledDescription variant='aboutText'>
          <p>
            Мы отбираем произведения для издания вне зависимости от известности
            автора, работаем с несерийными и неформальными произведениями и
            считаем, что книгоиздание не должно быть бизнесом.
          </p>
        </StyledDescription>
        <StyledButton variant='small'>Манифест Чтива</StyledButton>
      </div>
    </StyledDescriptionContainer>
  </StyledSection>
);

export default AboutUs;
