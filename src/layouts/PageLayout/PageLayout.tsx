import * as React from 'react';
import Head from 'next/head';
// import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import { StyledContent, StyledWrapper } from './styles';
import Popups from '@/components/Popups';

export interface PageLayoutProps {
  readonly headTitle?: string;
}

const PageLayout: React.FC<PageLayoutProps> = (props) => {
  const {
    children,
    headTitle = 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
  } = props;
  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledWrapper>
        {/* <Header /> */}
        <StyledContent>{children}</StyledContent>
        <Footer />
        <Popups />
      </StyledWrapper>
    </>
  );
};

export default PageLayout;
