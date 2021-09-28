import React from 'react';
import Link from 'next/link';
import type { NextPage } from 'next';

const Book: NextPage = () => (
  <>
    <h2>
      <Link href="/books/first-book">
        <a href="fakeHref">To first book</a>
      </Link>
    </h2>
    <h2>
      <Link href="/books/second-book">
        <a href="fakeHref">To second book</a>
      </Link>
    </h2>
  </>
);

export default Book;
