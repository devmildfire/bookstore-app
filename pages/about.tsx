import React from 'react';
import styled from 'styled-components';
import AboutList from '../src/components/AboutPage/AboutList';
import AboutUs from '../src/components/AboutPage/AboutUs';
import RD from '../src/components/AboutPage/RD';
import Video from '../src/components/AboutPage/Video';
import Container from '../src/components/Common/Container';
import breakPoints from '../src/utils/breakPoints';
import stars from '../src/assets/images/stars.webp';
import We from '../src/components/AboutPage/We';
import Partners from '../src/components/AboutPage/Partners';
import Text from '../src/components/Common/Text';
import BeWithUs from '../src/components/AboutPage/BeWithUs';

const StyledWrapper = styled.main`
  --marginBottom: 170px;
  --lastMarginBottom: 250px;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom);
  }

  & > :last-child {
    padding-bottom: var(--lastMarginBottom);
  }

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
    --lastMarginBottom: 200px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
    --lastMarginBottom: 175px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
  }
`;

const StyledStarsBlock = styled.section`
  background-image: url(${stars.src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom);
  }
`;

const About = (): React.ReactElement => (
  <StyledWrapper>
    <Container>
      <Video src='fakePath' />
    </Container>
    <Container>
      <AboutList />
    </Container>
    <AboutUs />
    <Container>
      <RD />
    </Container>
    <StyledStarsBlock>
      <Container>
        <We />
      </Container>
      <Container>
        <Partners />
      </Container>
      <Container>
        <Text
          component='h2'
          fontFamily='serif'
          align='center'
          textTransform='uppercase'
        >
          Задонатить Чтиву
        </Text>
      </Container>
      <Container>
        <BeWithUs />
      </Container>
    </StyledStarsBlock>
  </StyledWrapper>
);

export default About;
