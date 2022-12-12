import React from 'react';
import styled from 'styled-components';
import aboutInfo from '@/mocks/aboutInfo';
import AboutCard from './AboutCard';
import { StyledList } from './styles';
import Text from '@/components/Common/Text';
import breakPoints from '@/utils/breakPoints';

const StyledTitle = styled(Text)`
  padding-bottom: 60px;

  @media ${breakPoints.xl} {
    padding-bottom: 60px;
  }

  @media ${breakPoints.lg} {
    padding-bottom: 50px;
  }

  @media ${breakPoints.smd} {
    padding-bottom: 30px;
  }

  @media ${breakPoints.sm} {
    padding-bottom: 10px;
  }
`;

const RelativeDiv = styled.div`
  position: relative;
  margin: 0;
  width: var(--width);
`;

const AboutList = (): React.ReactElement => {
  return (
    <RelativeDiv>
      <StyledTitle variant='h2_1' align='center'>
        ТИПЫ ИЗДАНИЙ
      </StyledTitle>
      <StyledList>
        {aboutInfo.map((about) => (
          <AboutCard {...about} key={about.content} />
        ))}
      </StyledList>
    </RelativeDiv>
  );
};

export default AboutList;
