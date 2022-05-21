import React from 'react';
import styled from 'styled-components';
import AboutList from '../src/components/AboutPage/AboutList';
import Video from '../src/components/AboutPage/Video';
import Container from '../src/components/Common/Container';
import breakPoints from '../src/utils/breakPoints';

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  padding-top: var(--paddingTop, 40px);

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
    --marginBottom: 70px;
    --paddingTop: 20px;
  }
`;

const About = (): React.ReactElement => (
  <StyledContainer>
    <Video src='fakePath' />
    <AboutList />
  </StyledContainer>
);

export default About;
