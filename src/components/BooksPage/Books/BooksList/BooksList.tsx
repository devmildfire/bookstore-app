import React from 'react';
import { Book, useGetBooksQuery } from '@/models/books';
import separateOnRow from '@/utils/separateOnRow';
import BookRow from './BookRow';
import { StyledProductsList } from './styles';

const BooksList = (): React.ReactElement => {
  const { data: books = [] } = useGetBooksQuery(undefined);
  const separatedBooks: Book[][] = separateOnRow(books, 3);
  return (
    <StyledProductsList>
      {separatedBooks.map((row) => (
        /*  Нужно подумать, какой ключ дать */
        <BookRow books={row} />
      ))}
    </StyledProductsList>
  );
};

export default BooksList;
