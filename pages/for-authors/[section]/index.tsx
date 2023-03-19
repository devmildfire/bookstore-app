import type { NextPage } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
// import breakPoints from '@/utils/breakPoints';
import TwoPaneGrid from '@/components/forAuthorsPage/TwoPaneGrid';
import SidebarNav from '@/components/forAuthorsPage/SidebarNav';
import sidebarItems from '@/mocks/sidebarItems';

const ForAuthors: NextPage = () => {
  const router = useRouter();
  return (
    <StyledWrapper>
      <TwoPaneGrid>
        <SidebarNav header='Авторам' navItems={sidebarItems} />
        <StyledSection>
          <h1>{router.query.section}</h1>
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
  outline: 1px solid white;
  /* background-color: green; */
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default ForAuthors;
