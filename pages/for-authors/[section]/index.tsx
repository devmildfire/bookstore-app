import type { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
// import breakPoints from '@/utils/breakPoints';
import TwoPaneGrid from '@/components/forAuthorsPage/TwoPaneGrid';
import SidebarNav from '@/components/forAuthorsPage/SidebarNav';
import sidebarItems from '@/mocks/sidebarItems';
import Abzac from '@/components/forAuthorsPage/Abzac';
// import breakPoints from '@/utils/breakPoints';

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

const DolorP = () => {
  return (
    <p>
      Dolor sit amet consectetur adipisicing elit. Ea architecto ipsa officia
      quisquam veniam omnis enim quia, id voluptate, ullam qui quae dolores
      quaerat doloribus non voluptatem vero magni totam!
    </p>
  );
};

const abzac = <Abzac />;
const lorem = <LoremP />;
const ipsum = <IpsumP />;
const dolor = <DolorP />;

//  стоит как-то увязать с массивом SIdebarItems и его типом

// const lookUp = {
//   main: lorem,
//   'send-novel': ipsum,
//   'send-manuscript': dolor,
//   abzac: lorem,
// };

// sidebarItems[0].link.split('/')[-1];

const lookUp = {
  main: lorem,
  'send-novel': ipsum,
  'send-manuscript': dolor,
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
        <StyledSection>
          {/* <h1>{router.query.section}</h1> */}
          {content}
        </StyledSection>
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

export default ForAuthors;
