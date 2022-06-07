import React from 'react';
import { Book } from '@/types/book';
import { ClassNameProps } from '@/types/className';
import StyledProductsList from './styles';
import BookCard from '../BookCard';

export interface BooksListProps extends ClassNameProps {
  readonly books: Book[];
}

const BooksList = (props: BooksListProps): React.ReactElement => {
  const { books, className } = props;

  return (
    <StyledProductsList className={className}>
      {books.map((book) => (
        <BookCard book={book} key={book.id} />
      ))}
    </StyledProductsList>
  );
};

export default BooksList;
