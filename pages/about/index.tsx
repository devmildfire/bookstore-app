import React from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
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
import rorshah from '@/assets/images/rorshah-chtivo-about.webp';

const About: NextPage = () => (
  <StyledWrapper>
    <Container>
      <Video src='/videos/chtivo.mp4' />
    </Container>
    <AboutUs />
    <AboutList />
    <RD />
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
  --lastMarginBottom: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  gap: 160px;

  /* & > :last-child {
    padding-bottom: var(--lastMarginBottom);
  } */

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
    padding-top: 0px;
    gap: 140px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
    --lastMarginBottom: 200px;
    padding-top: 0px;
    gap: 100px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
    --lastMarginBottom: 175px;
    padding-top: 0px;
    gap: 60px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
    padding-top: 0px;
    gap: 60px;
  }
`;

const StyledStarsBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 130px;
  background-image: url(${rorshah.src});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;
  padding-bottom: 120px;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5)
      linear-gradient(
        to bottom,
        #121212 0%,
        rgba(0, 0, 0, 0) 50%,
        hsl(0, 0%, 0%) 120%
      );
  }
`;
