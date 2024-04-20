import * as React from 'react';
// import styled from 'styled-components';
import Head from 'next/head';
import Header from '@/components/PageLayout/Header';
import Footer from '@/components/PageLayout/Footer';
import { StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';

export interface PageLayoutProps {
  readonly headTitle?: string;
  readonly withHeader?: boolean;
  readonly withFooter?: boolean;
  readonly shouldBlacken?: boolean;
}

const PageLayout: React.FC<PropsWithChildren<PageLayoutProps>> = (props) => {
  const {
    children,
    headTitle = 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
    withHeader = true,
    withFooter = true,
    shouldBlacken = false,
  } = props;
  const router = useRouter();
  return (
    <>
      <Head>
        <title>{headTitle}</title>
      </Head>
      <StyledWrapper>
        {withHeader && (
          <Header
            backgroundColor={
              shouldBlacken && router.pathname === '/books'
                ? '#050505'
                : 'var(--main-black)'
            }
          />
        )}
        {children}
        {withFooter && <Footer />}
      </StyledWrapper>
    </>
  );
};

export default PageLayout;
