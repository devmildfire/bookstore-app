import React from 'react';
import aboutInfo from '../../../utils/aboutInfo';
import AboutCard from '../AboutCard';
import StyledList from './styles';

const AboutList = (): React.ReactElement => (
  <StyledList>
    {aboutInfo.map((about) => (
      <AboutCard {...about} key={about.content} />
    ))}
  </StyledList>
);

export default AboutList;
