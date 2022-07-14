import * as React from 'react';
import { Book } from '@/models/books';
import { StyledRowWrapper } from './styles';
import Container from '@/components/Common/Container';
import Row from '@/components/Common/Row';
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
        <Row gap={168}>
          {books.map((book) => (
            <BookCard {...book} key={book.id} />
          ))}
        </Row>
      </Container>
      <BookPreview books={books} />
    </StyledRowWrapper>
  );
};

export default BookRow;
