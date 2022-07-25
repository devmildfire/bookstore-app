import * as React from 'react';
import { Book } from '@/models/books';
import { StyledRow, StyledRowWrapper } from './styles';
import Container from '@/components/Common/Container';
import BookPreview from './BookPreview';
import BookCard from './BookCard';

interface BookRowProps {
  readonly books: Book[];
}

const BookRow: React.FC<BookRowProps> = (props) => {
  const { books } = props;
  return (
    <StyledRowWrapper>
      <Container>
        <StyledRow>
          {books.map((book) => (
            <BookCard {...book} key={book.id} />
          ))}
        </StyledRow>
      </Container>
      <BookPreview books={books} />
    </StyledRowWrapper>
  );
};

export default BookRow;
