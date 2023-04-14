import type { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
import stonks from '@/assets/images/Vector_Stonks.svg';
import Text from '@/components/Common/Text';
import Content from '@/components/ForInvestorsPage/Content';
import breakPoints from '@/utils/breakPoints';
// import breakPoints from '@/utils/breakPoints';

const title = 'Уважаемые инвесторы и донаторы';

const ForInvestors: NextPage = () => {
  return (
    <StyledWrapper>
      <ToInvestors variant='h3_1Man' className='title'>
        {title}
      </ToInvestors>
      <Content />
      <Stonks1 as={stonks as any} />
      <Stonks2 as={stonks as any} />
    </StyledWrapper>
  );
};

const ToInvestors = styled(Text)`
  grid-area: title;
`;

const StyledWrapper = styled.main`
  // display: flex;
  // flex-direction: column;
  * {
    outline: 1px solid green;
  }

  align-items: center;

  display: grid;
  grid-template-areas:
    'title title'
    'content stonks2'
    'stonks1 .';

  padding-top: 100px;
  padding-bottom: 100px;
  padding-left: 239px;
  padding-right: 115px;

  @media screen and (max-width: 1600px) {
  }

  @media ${breakPoints.xl} {
  }

  @media screen and (max-width: 1200px) {
  }

  @media ${breakPoints.lg} {
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Stonks1 = styled.svg`
  grid-area: stonks1;
  height: 10vh;
  width: 100%;
`;

const Stonks2 = styled.svg`
  grid-area: stonks2;
  height: 100%;
  width: 30vw;
`;

export default ForInvestors;
