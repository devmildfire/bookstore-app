import React from 'react';
import styled from 'styled-components';
import AboutList from '../src/components/AboutPage/AboutList';
import AboutUs from '../src/components/AboutPage/AboutUs';
import Video from '../src/components/AboutPage/Video';
import Container from '../src/components/Common/Container';
import breakPoints from '../src/utils/breakPoints';

const StyledWrapper = styled.main`
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  & > :not(:last-child) {
    margin-bottom: var(--marginBottom, 170px);
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

const About = (): React.ReactElement => (
  <StyledWrapper>
    <Container>
      <Video src='fakePath' />
    </Container>
    <Container>
      <AboutList />
    </Container>
    <AboutUs />
  </StyledWrapper>
);

export default About;
