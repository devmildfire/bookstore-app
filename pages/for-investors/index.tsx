import type { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
// import stonks from '@/assets/images/Vector_Stonks.svg';
import stonksLow1 from '@/assets/images/Vector_Stonks_Low_1.svg';
import stonksHigh1 from '@/assets/images/Vector_Stonks_High_1.svg';
import Text from '@/components/Common/Text';
import Content from '@/components/ForInvestorsPage/Content';
import breakPoints from '@/utils/breakPoints';
// import breakPoints from '@/utils/breakPoints';

const title = 'Уважаемые инвесторы и донаторы';

const ForInvestors: NextPage = () => {
  return (
    <StyledWrapper>
      <ToInvestors variant='h1_Inv'>{title}</ToInvestors>
      <Content />
      <Stonks1 as={stonksLow1} />
      <Stonks2 as={stonksHigh1} />
      <Stonks3 as={stonksLow1} />
      <Stonks4 as={stonksHigh1} />
    </StyledWrapper>
  );
};

const ToInvestors = styled(Text)`
  grid-area: title;
`;

const StyledWrapper = styled.main`
  /* * {
    outline: 1px solid green;
  } */

  align-items: center;

  display: grid;

  grid-template-columns: auto auto;

  grid-template-areas:
    'title title'
    'content stonks2'
    'stonks1 .';

  padding-top: 100px;
  padding-bottom: 100px;
  /* padding-left: 239px; */
  /* padding-left: 10vw; */
  padding-left: calc((100vw - 1440px) / 2);
  padding-right: 115px;

  @media ${breakPoints.xxl} {
    padding-top: 100px;
    padding-bottom: 100px;
    /* padding-left: 120px; */
    padding-left: 10vw;
    padding-right: 60px;
  }

  @media screen and (max-width: 1600px) {
    padding-top: 100px;
    padding-bottom: 100px;
    /* padding-left: 120px; */
    padding-left: 10vw;
    padding-right: 60px;
  }

  @media ${breakPoints.xl} {
    padding-top: 100px;
    padding-bottom: 100px;
    /* padding-left: 120px; */
    padding-left: 10vw;
    padding-right: 60px;
  }

  @media screen and (max-width: 1200px) {
    padding-top: 100px;
    padding-bottom: 100px;
    /* padding-left: 100px; */
    padding-left: 10vw;
    padding-right: 50px;
  }

  @media ${breakPoints.lg} {
    /* padding-left: 10vw; */
    padding-left: 5vw;
    padding-right: 5vw;
  }

  @media ${breakPoints.md} {
    grid-template-columns: 3fr 1fr;

    /* grid-template-areas:
      'title title'
      'content content'
      '. stonks2'
      'stonks1 .'; */

    grid-template-areas:
      'title title'
      '. stonks2'
      'stonks1 .'
      'content content';
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    padding-top: 50px;
    padding-bottom: 50px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const Stonks1 = styled.svg`
  grid-area: stonks1;
  height: 10vh;
  width: 100%;

  /* @media screen and (max-width: 1600px) {
    width: 22vw;
  }

  @media ${breakPoints.xl} {
    width: 22vw;
  }

  @media screen and (max-width: 1200px) {
    width: 15.5vw;
  }

  @media ${breakPoints.lg} {
    width: 15.5vw;
  } */

  @media ${breakPoints.md} {
    /* width: 65vw; */
    /* width: 100%; */
    height: 10vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Stonks2 = styled.svg`
  grid-area: stonks2;
  height: 100%;
  max-height: 1550px;
  width: 30vw;

  @media screen and (max-width: 1600px) {
    width: 22vw;
  }

  @media ${breakPoints.xl} {
    width: 22vw;
  }

  @media screen and (max-width: 1200px) {
    width: 15.5vw;
  }

  @media ${breakPoints.lg} {
    width: 15.5vw;
  }

  @media ${breakPoints.md} {
    width: 100%;
    height: 60vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Stonks3 = styled.svg`
  position: relative;
  color: red;
  bottom: 3vw;
  left: 3vw;
  grid-area: stonks1;
  height: 10vh;
  width: 100%;

  @media ${breakPoints.md} {
    /* width: 65vw; */
    /* width: 100%; */
    height: 10vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Stonks4 = styled.svg`
  position: relative;
  color: red;
  bottom: 3vw;
  left: 3vw;
  grid-area: stonks2;
  height: 100%;
  max-height: 1550px;
  width: 30vw;

  @media screen and (max-width: 1600px) {
    width: 22vw;
  }

  @media ${breakPoints.xl} {
    width: 22vw;
  }

  @media screen and (max-width: 1200px) {
    width: 15.5vw;
  }

  @media ${breakPoints.lg} {
    width: 15.5vw;
  }

  @media ${breakPoints.md} {
    width: 100%;
    height: 60vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

export default ForInvestors;
