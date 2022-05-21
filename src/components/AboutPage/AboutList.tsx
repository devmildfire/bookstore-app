import React from 'react';
import styled from 'styled-components';
import aboutInfo from '../../utils/aboutInfo';
import AboutCard from './AboutCard';

const StyledList = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const AboutList = () => (
  <StyledList>
    {aboutInfo.map((about) => (
      <AboutCard {...about} />
    ))}
  </StyledList>
);

export default AboutList;
