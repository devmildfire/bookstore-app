import React from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';

import PageLayout from '../src/components/PageLayout/PageLayout';
import MainPage from '../src/components/MainPage';

const Home: NextPage = () => (
  <PageLayout>
    <>
      <MainPage />
      <h1>
        <Link href="/books" passHref>
          <a href="fakeHref">Books</a>
        </Link>
      </h1>
    </>
  </PageLayout>
);

export default Home;
