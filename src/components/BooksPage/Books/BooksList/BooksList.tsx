import React from 'react';
import { StyledProductsList } from './styles';
import useTypedSelector from '@/hooks/useTypedSelector';
import { Book, selectBooks } from '@/models/books';
import separateOnRow from '@/utils/separateOnRow';
import BookRow from './BookRow';

const BooksList = (): React.ReactElement => {
  const books = useTypedSelector(selectBooks);
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
