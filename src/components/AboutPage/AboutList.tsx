import React from 'react';
import styled from 'styled-components';
import aboutInfo from '../../utils/aboutInfo';
import breakPoints from '../../utils/breakPoints';
import AboutCard from './AboutCard';

const StyledList = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  width: 100%;

  @media ${breakPoints.xl} {
    gap: 10px;
  }

  @media ${breakPoints.lg} {
    gap: 7px;
  }

  @media ${breakPoints.md} {
    gap: 4px;
  }

  @media ${breakPoints.sm} {
    gap: 0px;
  }
`;

const AboutList = (): React.ReactElement => (
  <StyledList>
    {aboutInfo.map((about) => (
      <AboutCard {...about} />
    ))}
  </StyledList>
);

export default AboutList;
