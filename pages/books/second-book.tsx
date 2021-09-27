import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const SecondBook = (): React.ReactElement => (
  <>
    <Head>
      <title>Second book</title>
    </Head>
    <h1>Second book</h1>
    <h2>
      <Link href="/">
        <a>Back to home</a>
      </Link>
    </h2>
  </>
);

export default SecondBook;
