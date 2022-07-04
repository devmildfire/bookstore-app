import React from 'react';
import StyledProductsList from './styles';
import BookCard from './BookCard';
import useTypedSelector from '@/hooks/useTypedSelector';
import { selectBooks } from '@/models/books';

const BooksList = (): React.ReactElement => {
  const books = useTypedSelector(selectBooks);
  return (
    <StyledProductsList>
      {books.map((book) => (
        <BookCard book={book} key={book.id} />
      ))}
    </StyledProductsList>
  );
};

export default BooksList;
