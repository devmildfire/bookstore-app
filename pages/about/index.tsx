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
import rorshah from '@/assets/images/rorshah_whole_2.png';
import Text from '@/components/Common/Text';

const About: NextPage = () => (
  <StyledWrapper>
    <VideoContainer>
      <PageTitle />
      <Video src='/videos/chtivo.mp4' poster='/images/poster.png' />
    </VideoContainer>
    <AboutUs />
    <AboutList />
    <RD />
    <StyledStarsBlock>
      <We />
      <Partners />
      <Donate />
      <BeWithUs />
    </StyledStarsBlock>
  </StyledWrapper>
);

export default About;

const StyledText = styled(Text)<{ classname: string }>`
  padding-top: 100px;
  padding-bottom: 60px;

  @media ${breakPoints.xl} {
    padding-bottom: 60px;
  }

  @media ${breakPoints.lg} {
    padding-top: 65px;
    padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
    padding-top: 40px;
    padding-bottom: 30px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    padding-bottom: 10px;
  }
`;

const PageTitle = (): React.ReactElement => (
  <StyledText classname='TitleText' align='center' variant='h2_1'>
    О Чтиве
  </StyledText>
);

const VideoContainer = styled(Container)`
  max-width: var(--width);
  width: 100%;
  display: grid;
  justify-items: center;
  margin: 0;
`;

const StyledWrapper = styled.main`
  --marginBottom: 170px;
  --lastMarginBottom: 600px;
  /* --rowGap: 150px; */
  --rowGap: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 0px;
  gap: var(--rowGap);

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
    padding-top: 0px;
    --rowGap: 100px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
    --lastMarginBottom: 200px;
    padding-top: 0px;
    /* --rowGap: 100px; */
    --rowGap: 60px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
    --lastMarginBottom: 175px;
    padding-top: 0px;
    /* --rowGap: 70px; */
    --rowGap: 40px;
  }

  @media ${breakPoints.smd} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
    padding-top: 0px;
    /* --rowGap: 70px; */
    --rowGap: 40px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
    --lastMarginBottom: 150px;
    padding-top: 0px;
    /* --rowGap: 70px; */
    --rowGap: 40px;
  }
`;

const StyledStarsBlock = styled.section`
  width: 100%;
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

  @media ${breakPoints.xxl} {
    aspect-ratio: 1920/2800;
  }

  @media ${breakPoints.xl} {
    aspect-ratio: auto;
  }

  @media ${breakPoints.lg} {
    gap: 100px;
  }

  @media ${breakPoints.md} {
    gap: 80px;
  }

  @media ${breakPoints.smd} {
    gap: 80px;
  }

  @media ${breakPoints.sm} {
    gap: 60px;
  }
`;
