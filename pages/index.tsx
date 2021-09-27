import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import type { NextPage } from 'next';
import MainPage from '../components/MainPage';

const Home: NextPage = () => (
  <>
    <Head>
      <title>
        ЧТИВО | Независимое издательство современной художественной литературы — официальный сайт
      </title>
    </Head>
    <MainPage />
    <h1>
      <Link href="/books" passHref>
        <a href="fakeHref">Books</a>
      </Link>
    </h1>
  </>
);

export default Home;
