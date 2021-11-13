import React from 'react';
import Head from 'next/head';

import styled from 'styled-components';

import Header from './Header';
import Footer from './Footer';

interface IPageLayout {
  children: React.ReactElement,
  headTitle?: string,
}

const PageLayout = ({
  children,
  headTitle,
}: IPageLayout): React.ReactElement => (
  <>
    <Head>
      <title>
        {headTitle}
      </title>
    </Head>
    <StyleWrapper>
      <Header />
      <div className='children'>
        {children}
      </div>
      <Footer />
    </StyleWrapper>
  </>
);

PageLayout.defaultProps = {
  headTitle: 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
};

export default PageLayout;

const StyleWrapper = styled.div`
  width: 100%;
  position: relative;
  background-color: black;
  color: white;

  .children {
    width: 100%;
  }
`;
