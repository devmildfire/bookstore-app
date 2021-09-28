import React from 'react';
import Head from 'next/head';

import Header from './Header';
import Footer from './Footer';

import styles from './PageLayout.module.css';

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
    <div className={styles.body}>
      <Header />
      <div className={styles.children}>
        {children}
      </div>
      <Footer />
    </div>
  </>
);

PageLayout.defaultProps = {
  headTitle: 'ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт',
};

export default PageLayout;
