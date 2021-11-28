import React from 'react';
import Head from 'next/head';

import styled from 'styled-components';

import Header from './Header';
import Footer from './Footer';
import Slider from './Slider';
import booksData from '../../utils/booksData';

const StyledWrapper = styled.div`
  width: 100%;
  position: relative;
  background-color: black;
  color: white;
`;

const Content = styled.div`
  width: 100%;
  min-height: 100vh;
`;

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
    <StyledWrapper>
      <Header />
      <Slider books={booksData} />
      <Content>
        {children}
      </Content>
      <Footer />
    </StyledWrapper>
  </>
);

PageLayout.defaultProps = {
  headTitle: 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
};

export default PageLayout;
