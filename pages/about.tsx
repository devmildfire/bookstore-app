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

const StyledWrapper = styled.main`
  --marginBottom: 170px;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom);
  }

  @media ${breakPoints.xl} {
    --marginBottom: 150px;
  }

  @media ${breakPoints.lg} {
    --marginBottom: 100px;
  }

  @media ${breakPoints.md} {
    --marginBottom: 85px;
  }

  @media ${breakPoints.sm} {
    padding-top: 20px;
    --marginBottom: 70px;
  }
`;

const StyledStarsBlock = styled.section`
  background-image: url(${stars.src});
  background-repeat: no-repeat;
  background-size: cover;
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
    </StyledStarsBlock>
  </StyledWrapper>
);

export default About;
