import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Book = (): React.ReactElement => {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <>
      <Head>
        <title>First book</title>
      </Head>
      <h1>{slug}</h1>
    </>
  );
};

export default Book;
