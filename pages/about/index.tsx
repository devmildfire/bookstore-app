import React from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import AboutList from '@/components/AboutPage/AboutList';
import AboutUs from '@/components/AboutPage/AboutUs';
import RD from '@/components/AboutPage/RD';
import Video from '@/components/AboutPage/Video';
import Container from '@/components/Common/Container';
import ContainerWide from '@/components/Common/ContainerWide';
import We from '@/components/AboutPage/We';
import Partners from '@/components/AboutPage/Partners';
import BeWithUs from '@/components/AboutPage/BeWithUs';
import Donate from '@/components/AboutPage/Donate';
import breakPoints from '@/utils/breakPoints';
// import rorshah from '@/assets/images/rorshah-chtivo-about.webp';
import rorshah from '@/assets/images/rorshah_new.png';

const About: NextPage = () => (
  <StyledWrapper>
    <VideoContainer>
      <Video src='/videos/chtivo.mp4' poster='/images/poster.png' />
    </VideoContainer>
    <AboutUs />
    <AboutList />
    <RD />
    <StyledStarsBlock>
      <ContainerWide>
        <We />
      </ContainerWide>
      <ContainerWide>
        <Partners />
      </ContainerWide>
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

const VideoContainer = styled(Container)`
  height: calc(var(--width) * 9 / 16 - var(--top-div-gap));
  /* height: calc(var(--width) * 9 / 16); */
  width: var(--width);
`;

const StyledWrapper = styled.main`
  --marginBottom: 170px;
  --lastMarginBottom: 600px;
  --rowGap: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0px;
  gap: var(--rowGap);

  /* * {
    outline: 1px solid green !important;
  } */

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
    padding-top: 0px;
    --rowGap: 150px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
    --lastMarginBottom: 200px;
    padding-top: 0px;
    --rowGap: 100px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
    --lastMarginBottom: 175px;
    padding-top: 0px;
    --rowGap: 70px;
  }

  @media ${breakPoints.smd} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
    padding-top: 0px;
    --rowGap: 70px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
    padding-top: 0px;
    --rowGap: 70px;
  }
`;

const StyledStarsBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 130px;
  background: url(${rorshah.src}),
    linear-gradient(to bottom, var(--main-white-40) 0%, var(--main-black) 90%);
  background-repeat: no-repeat, no-repeat;
  background-size: contain, cover;
  background-position: top, center;
  position: relative;
  padding-bottom: 120px;
  aspect-ratio: 1920/2500;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: calc(-1 * var(--rowGap));
    left: 0;
    bottom: 100%;
    right: 0;

    background: black;
  }

  @media ${breakPoints.xl} {
    aspect-ratio: 1920/3500;
  }

  @media ${breakPoints.lg} {
    aspect-ratio: 1920/3600;
  }

  @media ${breakPoints.md} {
    aspect-ratio: 1920/4200;
  }

  @media ${breakPoints.smd} {
    aspect-ratio: 1920/4400;
  }

  @media ${breakPoints.sm} {
    aspect-ratio: 1920/8000;
  }
`;
