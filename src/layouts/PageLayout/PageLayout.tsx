import * as React from 'react';
// import styled from 'styled-components';
import Head from 'next/head';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import { StyledContent, StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';

export interface PageLayoutProps {
  readonly headTitle?: string;
  readonly withHeader?: boolean;
  readonly withFooter?: boolean;
}

const PageLayout: React.FC<PropsWithChildren<PageLayoutProps>> = (props) => {
  const {
    children,
    headTitle = 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
    withHeader = true,
    withFooter = true,
  } = props;
  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledWrapper>
        {withHeader && <Header />}
        {/* <StyledContent> */}
        {children}
        {/* </StyledContent> */}
        {withFooter && <Footer />}
      </StyledWrapper>
    </>
  );
};

export default PageLayout;
