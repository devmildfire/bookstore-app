import React from 'react';
import AboutList from '@/components/AboutPage/AboutList';
import AboutUs from '@/components/AboutPage/AboutUs';
import RD from '@/components/AboutPage/RD';
import Video from '@/components/AboutPage/Video';
import Container from '@/components/Common/Container';
import We from '@/components/AboutPage/We';
import Partners from '@/components/AboutPage/Partners';
import BeWithUs from '@/components/AboutPage/BeWithUs';
import Donate from '@/components/AboutPage/Donate';
import { StyledStarsBlock, StyledWrapper } from './styles';

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
