import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

import Header from './Header';
import Footer from './Footer';

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  background-color: var(--black);
  color: var(--white);
`;

const Content = styled.div`
  width: 100%;
  min-height: 100vh;
`;

export interface PageLayoutProps {
  readonly children: React.ReactElement;
  readonly headTitle?: string;
}

const PageLayout = ({
  children,
  headTitle = 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
}: PageLayoutProps): React.ReactElement => (
  <>
    <Head>
      <title>{headTitle}</title>
    </Head>
    <StyledWrapper>
      <Header />
      <Content>{children}</Content>
      <Footer />
    </StyledWrapper>
  </>
);

export default PageLayout;
