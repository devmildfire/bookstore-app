import React from 'react';
import type { GetServerSideProps, NextPage } from 'next';
import HomePage from '@/components/HomePage';
import BooksList from '@/components/BooksList';
import { Book } from '@/types/book';
import booksData from '@/mocks/books';

interface BooksPageProps {
  readonly books: Book[];
}

const Books: NextPage<BooksPageProps> = (props) => {
  const { books } = props;
  return (
    <HomePage>
      <BooksList books={books} />
    </HomePage>
  );
};

export const getServerSideProps: GetServerSideProps<
  BooksPageProps
> = async () => ({
  props: {
    books: booksData,
  },
});

export default Books;
