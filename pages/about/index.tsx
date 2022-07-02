import React from 'react';
import styled from 'styled-components';
import AboutList from '@/components/AboutPage/AboutList';
import AboutUs from '@/components/AboutPage/AboutUs';
import RD from '@/components/AboutPage/RD';
import Video from '@/components/AboutPage/Video';
import Container from '@/components/Common/Container';
import We from '@/components/AboutPage/We';
import Partners from '@/components/AboutPage/Partners';
import BeWithUs from '@/components/AboutPage/BeWithUs';
import Donate from '@/components/AboutPage/Donate';
import breakPoints from '@/utils/breakPoints';
import stars from '@/assets/images/stars.webp';

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
        <Donate />
      </Container>
      <Container>
        <BeWithUs />
      </Container>
    </StyledStarsBlock>
  </StyledWrapper>
);

export default About;

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
