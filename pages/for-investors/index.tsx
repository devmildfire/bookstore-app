import type { NextPage } from 'next';
import React from 'react';
import styled from 'styled-components';
import MoneyPlanes from '@/assets/images/Money_Planes.svg';
import Text from '@/components/Common/Text';
import Content from '@/components/ForInvestorsPage/Content';
import breakPoints from '@/utils/breakPoints';

const title = 'Уважаемые Социнвесторы';

const ForInvestors: NextPage = () => {
  return (
    <StyledWrapper className='max-width'>
      <StyledMoneyPlanes />
      <ContentWrapper>
        <ToInvestors variant='h1c'>{title}</ToInvestors>
        <Content />
      </ContentWrapper>
    </StyledWrapper>
  );
};

const StyledMoneyPlanes = styled(MoneyPlanes)`
  /* padding-top: 114px;

  @media ${breakPoints.xl} {
    padding-top: 80px;
  }

  @media ${breakPoints.lg} {
    padding-top: 80px;
  }

  @media ${breakPoints.sm} {
    padding-top: 0px;
  } */
`;

const ContentWrapper = styled.div`
  /* padding: 90px 5.6vw 0; */
  /* padding: 90px 0 0; */

  align-self: flex-start;
  padding-left: calc(40vw - 720px);

  padding-top: var(--first-title-gap);

  display: flex;
  flex-direction: column;

  /* gap: 96px; */
  gap: var(--first-title-gap);

  @media ${breakPoints.xl} {
    /* padding: 90px 3.5vw 0; */
    /* padding: 90px 0 0; */
    /* gap: 90px; */
  }

  @media ${breakPoints.lg} {
    /* padding-top: 60px; */
    /* padding: 60px 4.7vw 0; */
    /* padding: 60px 0 0; */
    /* gap: 60px; */
  }

  @media ${breakPoints.sm} {
    /* padding-top: 50px; */
    /* padding: 20px 0 0; */
    /* gap: 30px; */
  }
`;

const ToInvestors = styled(Text)`
  grid-area: title;

  @media ${breakPoints.md} {
    /* grid-area: 1 / 1 / 4 / 3; */
    padding: 0 0 10vw 0;
    /* font-size: 45px; */
  }

  @media ${breakPoints.smd} {
    padding: 0 0 10vw 0;
    /* font-size: 6vw; */
  }

  @media ${breakPoints.sm} {
    padding: 0 0 10vw 0;
    /* font-size: 6.5vw; */
  }
`;

const StyledWrapper = styled.main`
  align-items: center;

  display: flex;
  flex-direction: column;

  /* padding-top: 100px;
  padding-bottom: 100px;
  padding-left: calc((100vw - 1440px) / 2);
  padding-right: 115px; */

  padding: 0 10vw;
  padding-top: var(--header-gap);

  @media ${breakPoints.xxl} {
    /* padding-top: 100px;
    padding-bottom: 100px;
    padding-left: 10vw;
    padding-right: 60px; */
  }

  @media screen and (max-width: 1600px) {
    /* padding-top: 100px;
    padding-bottom: 100px;
    padding-left: 10vw;
    padding-right: 60px; */
  }

  @media ${breakPoints.xl} {
    /* padding-top: 100px;
    padding-bottom: 100px;
    padding-left: 10vw;
    padding-right: 60px; */
  }

  @media screen and (max-width: 1200px) {
    /* padding-top: 100px;
    padding-bottom: 100px;
    padding-left: 10vw;
    padding-right: 10vw; */
  }

  @media ${breakPoints.lg} {
    padding-left: 5vw;
    padding-right: 5vw;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
  }

  @media ${breakPoints.sm} {
    /* padding-top: 50px; */
    padding-bottom: 50px;
    padding-left: 5vw;
    padding-right: 5vw;
  }
`;

export default ForInvestors;
