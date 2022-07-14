import React from 'react';
import { Book, useGetBooksQuery } from '@/models/books';
import separateOnRow from '@/utils/separateOnRow';
import BookRow from './BookRow';
import List from '@/components/Common/List';

const BooksList = (): React.ReactElement => {
  const { data: books = [] } = useGetBooksQuery(undefined);
  const separatedBooks: Book[][] = separateOnRow(books, 3);
  return (
    <List gap={80}>
      {separatedBooks.map((row) => (
        /*  Нужно подумать, какой ключ дать */
        <BookRow books={row} />
      ))}
    </List>
  );
};

export default BooksList;
