import type { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
// import breakPoints from '@/utils/breakPoints';
import TwoPaneGrid from '@/components/forAuthorsPage/TwoPaneGrid';
import SidebarNav from '@/components/forAuthorsPage/SidebarNav';
import sidebarItems from '@/mocks/sidebarItems';
import Abzac from '@/components/forAuthorsPage/Abzac';
import SendManuscript from '@/components/forAuthorsPage/SendManuscript';
import breakPoints from '@/utils/breakPoints';

// const lines = sidebarItems.map((item) => item.link.split('/')[0]);
const lines = sidebarItems.map(
  (item) => item.link.split('/')[item.link.split('/').length - 1]
);

const LoremP = () => {
  return (
    <p>
      {/* Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo
      voluptatibus, asperiores culpa non animi amet, necessitatibus repellat
      accusamus veniam veritatis nesciunt ipsa, ab voluptatem accusantium
      quaerat enim quo ullam! Illum! */}

      {lines}
    </p>
  );
};

const IpsumP = () => {
  return (
    <p>
      Ipsum, dolor sit amet consectetur adipisicing elit. Ea architecto ipsa
      officia quisquam veniam omnis enim quia, id voluptate, ullam qui quae
      dolores quaerat doloribus non voluptatem vero magni totam!
    </p>
  );
};

// const DolorP = () => {
//   return (
//     <p>
//       Dolor sit amet consectetur adipisicing elit. Ea architecto ipsa officia
//       quisquam veniam omnis enim quia, id voluptate, ullam qui quae dolores
//       quaerat doloribus non voluptatem vero magni totam!
//     </p>
//   );
// };

const abzac = <Abzac />;
const sendManuscript = <SendManuscript />;
const lorem = <LoremP />;
const ipsum = <IpsumP />;
// const dolor = <DolorP />;

const lookUp = {
  main: lorem,
  'send-novel': ipsum,
  'send-manuscript': sendManuscript,
  abzac,
};

type routeType = 'main' | 'send-novel' | 'send-manuscript' | 'abzac';

const getComponent = (route: routeType): typeof abzac => {
  return lookUp[route];
};

const ForAuthors: NextPage = () => {
  const router = useRouter();

  const routerString = router.query.section as routeType;
  const content = getComponent(routerString);

  return (
    <StyledWrapper>
      <TwoPaneGrid>
        <SidebarNav header='Авторам' navItems={sidebarItems} />
        <UnderSection />
        <StyledSection>{content}</StyledSection>
      </TwoPaneGrid>
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
  --navHeigh: 366px;
  width: var(--navWidth);
  height: var(--navHeigh);

  @media ${breakPoints.xl} {
    --navWidth: 338px;
  }

  @media ${breakPoints.lg} {
    --navWidth: 314px;
  }

  @media ${breakPoints.md} {
  }

  @media ${breakPoints.smd} {
    --navHeigh: 272px;
    --navWidth: 100%;
  }
`;

export default ForAuthors;
