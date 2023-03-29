import React from 'react';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import Container from '@/components/Common/Container';
import Text from '@/components/Common/Text';
import Books from './Books';
import Button from '@/components/Common/Button';

const StyledDescriptionContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  max-width: 1440px;
  padding-top: 31px;
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
  width: calc(min(480px, var(--width)));
  max-height: 62px;
  min-height: 62px;
  margin-top: auto;
  min-width: 480px;

  @media screen and (max-width: 1600px) {
    max-height: 45px;
    min-height: 45px;
    margin-top: auto;
    min-width: 300px;
  }

  @media ${breakPoints.xl} {
    max-height: 45px;
    min-height: 45px;
    margin-top: auto;
    min-width: 300px;
  }

  @media screen and (max-width: 1100px) {
    max-height: 45px;
    min-height: 45px;
    margin-top: auto;
    min-width: 300px;
  }

  @media ${breakPoints.lg} {
    max-height: 45px;
    min-height: 45px;
    margin-top: auto;
    min-width: 300px;
  }

  @media ${breakPoints.smd} {
    max-height: 32px;
    min-height: 32px;
    margin-top: auto;
    min-width: 286px;
  }
`;

const StyledDescription = styled(Text)`
  max-width: 750px;
`;

const StyledSection = styled('section')`
  margin-top: 0px;
  width: 100%;
`;

const AboutUs = (): React.ReactElement => (
  <StyledSection>
    <Container>
      <Text align='center' variant='h2_1'>
        О чём мы?
      </Text>
    </Container>
    <Books />
    <StyledDescriptionContainer>
      <StyledDescription variant='aboutText'>
        Независимое издательство Чтиво — дитя петербургского литандеграунда и
        сети интернет, увидевшее свет в 2017 году.
      </StyledDescription>
      {/* <br /> */}
      <StyledDescription variant='aboutText'>
        Мы отбираем произведения для издания вне зависимости от известности
        автора, работаем с несерийными и неформальными текстами и считаем, что
        книгоиздание не должно быть бизнесом, а тем более&nbsp;— монополией.
      </StyledDescription>
      <StyledButton variant='small'>Манифест Чтива</StyledButton>
    </StyledDescriptionContainer>
  </StyledSection>
);

export default AboutUs;
