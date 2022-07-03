import React from 'react';
import { Book } from '@/types/book';
import { ClassNameProps } from '@/types/className';
import StyledProductsList from './styles';
import BookCard from '../BookCard';
import Container from '../Common/Container';

export interface BooksListProps extends ClassNameProps {
  readonly books: Book[];
}

const BooksList = (props: BooksListProps): React.ReactElement => {
  const { books, className } = props;

  return (
    <Container>
      <StyledProductsList className={className}>
        {books.map((book) => (
          <BookCard book={book} key={book.id} />
        ))}
      </StyledProductsList>
    </Container>
  );
};

export default BooksList;
