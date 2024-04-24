import type { NextPage } from 'next';
import React, { ReactElement } from 'react';
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
import navItems from '@/mocks/navItems';
import NotFoundPage from 'pages/not-found';
import PageLayout from '@/layouts/PageLayout';

type TRoutes = 'send-novel' | 'send-manuscript' | 'abzac';
type TQuery = { section: TRoutes };

type LookUpRoutes = {
  [key in TRoutes]: ReactElement;
};

const lookUp: LookUpRoutes = {
  'send-novel': <SendNovel />,
  'send-manuscript': <SendManuscript />,
  abzac: <Abzac />,
};

const ForAuthors: NextPage = () => {
  const router = useRouter();
  const routerQuery = router.query as TQuery;
  const slug = routerQuery.section ?? 'send-novel';

  const content = lookUp[slug];

  if (!content) {
    return <NotFoundPage />;
  }

  return (
    <PageLayout headTitle='Авторам'>
      <StyledWrapper>
        <Navigation navigationItems={navItems} />
        {/* <TwoPaneGrid>
        <SidebarNav header='Авторам' navItems={sidebarItems} />
        <UnderSection />
      </TwoPaneGrid> */}
        <StyledSection>{content}</StyledSection>
      </StyledWrapper>
    </PageLayout>
  );
};

const StyledWrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
`;

const StyledSection = styled.div`
  height: 100%;
  width: 100%;
  padding: 0 calc((100vw - 1440px) / 2);
  padding-top: var(--header-gap);

  @media ${breakPoints.xxl} {
    padding: var(--header-gap) 10vw 0;
  }

  @media ${breakPoints.lg} {
    padding: var(--header-gap) 5vw 0;
  }
`;

// comment added
export default ForAuthors;
