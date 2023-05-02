import type { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
// import breakPoints from '@/utils/breakPoints';
// import TwoPaneGrid from '@/components/forAuthorsPage/TwoPaneGrid';
// import SidebarNav from '@/components/forAuthorsPage/SidebarNav';
// import sidebarItems from '@/mocks/sidebarItems';
import Abzac from '@/components/forAuthorsPage/Abzac';
import SendManuscript from '@/components/forAuthorsPage/SendManuscript';
import breakPoints from '@/utils/breakPoints';
import SendNovel from '@/components/forAuthorsPage/SendNovel';
import Navigation from '@/components/Navigation';

const abzac = <Abzac />;
const sendManuscript = <SendManuscript />;
const sendNovel = <SendNovel />;

const lookUp = {
  'send-novel': sendNovel,
  'send-manuscript': sendManuscript,
  abzac,
};

type routeType = 'send-novel' | 'send-manuscript' | 'abzac';

const getComponent = (route: routeType): typeof abzac => {
  return lookUp[route];
};

const ForAuthors: NextPage = () => {
  const router = useRouter();

  const routerString = router.query.section as routeType;
  const content = getComponent(routerString);

  return (
    <StyledWrapper>
      {/* <TwoPaneGrid>
        <SidebarNav header='Авторам' navItems={sidebarItems} />
        <UnderSection />
      </TwoPaneGrid> */}
      <StyledSection>{content}</StyledSection>
      <Navigation />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledSection = styled.div`
  /* outline: 1px solid white; */
`;

const UnderSection = styled.div`
  /* outline: 1px solid white; */
  --navWidth: 450px;
  /* --navHeigh: 366px; */
  --navHeigh: 100%;
  width: var(--navWidth);
  height: var(--navHeigh);

  background: linear-gradient(
      346.55deg,
      rgba(147, 0, 0, 0.1) 1.08%,
      rgba(0, 0, 0, 0.1) 41.58%
    ),
    linear-gradient(
      163.22deg,
      rgba(202, 0, 0, 0.1) 0%,
      rgba(19, 19, 19, 0.1) 31.8%,
      rgba(0, 0, 0, 0.1) 55.09%
    ),
    var(--main-black);

  @media screen and (max-width: 1600px) {
    --navWidth: 338px;
  }

  @media ${breakPoints.xl} {
    --navWidth: 338px;
  }

  @media screen and (max-width: 1200px) {
    --navWidth: 314px;
  }

  @media ${breakPoints.lg} {
    --navWidth: 314px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    //  это свойство убирает меню навигации в мобильной версии
    display: none;

    --navHeigh: 366px;
    --navWidth: 100%;
  }

  @media ${breakPoints.sm} {
    --navHeigh: 272px;
    --navWidth: 100%;
  }
`;

export default ForAuthors;
