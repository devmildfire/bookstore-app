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

// const title = 'Уважаемые инвесторы и донаторы';
const title = 'Уважаемые инвесторы и донаторы';

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

  @media ${breakPoints.md} {
    grid-area: 1 / 2 / 4 / 4;
    padding: 0 15vw 0 0vw;
    font-size: 45px;
  }

  @media ${breakPoints.smd} {
    grid-area: 1 / 2 / 4 / 4;
    padding: 0 15vw 0 0vw;
    /* font-size: 35px; */
    font-size: 6vw;
  }

  @media ${breakPoints.sm} {
    /* grid-area: 1 / 1 / 3 / 3; */
    padding: 0 15vw 15vw 2vw;
    /* font-size: 20px; */
    font-size: 6.5vw;
  }
`;

const StyledWrapper = styled.main`
  align-items: center;

  display: grid;

  grid-template-columns: auto auto;

  grid-template-areas:
    'title title'
    'content stonks2'
    'stonks1 .';

  padding-top: 100px;
  padding-bottom: 100px;
  padding-left: calc((100vw - 1440px) / 2);
  padding-right: 115px;

  //  подрезка графика по левому полю хедера
  clip-path: inset(0px 0vw 0px calc((100vw - 1440px) / 2));

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
    /* padding-right: 50px; */
    padding-right: 10vw;

    //  подрезка графика по левому полю хедера
    clip-path: inset(0px 0vw 0px 10vw);
  }

  @media ${breakPoints.lg} {
    /* padding-left: 10vw; */
    padding-left: 5vw;
    padding-right: 5vw;

    //  подрезка графика по левому полю хедера
    clip-path: inset(0px 0vw 0px 5vw);
  }

  @media ${breakPoints.md} {
    grid-template-columns: 1fr 3fr 1fr 1fr;

    grid-template-areas:
      'title title title title'
      '. . stonks2 .'
      '. stonks1 . .'
      'content content content content';

    //  обрезка картинок графиков, чтобы они не выходили за поля хедера и текста
    clip-path: inset(0px 5vw 0px 5vw);
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    padding-top: 50px;
    padding-bottom: 50px;
    /* padding-left: 16px;
    padding-right: 16px; */
    padding-left: 5vw;
    padding-right: 5vw;
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
    height: 40vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

const Stonks3 = styled.svg`
  position: relative;
  color: red;
  bottom: -2vw;
  left: -2vw;
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
  bottom: -2vw;
  left: -2vw;
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
    height: 40vw;
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
  }
`;

export default ForInvestors;
