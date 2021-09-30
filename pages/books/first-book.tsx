import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const FirstBook = (): React.ReactElement => (
  <>
    <Head>
      <title>First book</title>
    </Head>
    <h1>First book</h1>
    <h2>
      <Link href='/'>
        <a href='fakeHref'>Back to home</a>
      </Link>
    </h2>
  </>
);

export default FirstBook;
