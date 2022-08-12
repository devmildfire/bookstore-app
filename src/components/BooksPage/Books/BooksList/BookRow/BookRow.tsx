import * as React from 'react';
import { Book } from '@/models/books';
import { StyledRow, StyledRowWrapper } from './styles';
import Container from '@/components/Common/Container';
import BookPreview from './BookPreview';
import BookCard from './BookCard';
import useGetParam from '@/hooks/useGetParam';
import { GET_PARAMS } from '@/consts/query';

interface BookRowProps {
  readonly books: Book[];
}

const BookRow: React.FC<BookRowProps> = (props) => {
  const { books } = props;
  const openBookId = Number(useGetParam(GET_PARAMS.openProduct));
  return (
    <StyledRowWrapper>
      <Container>
        <StyledRow inRow={books.length}>
          {books.map((book) => (
            <BookCard isOpen={openBookId === book.id} {...book} key={book.id} />
          ))}
        </StyledRow>
      </Container>
      <BookPreview books={books} openBookId={openBookId} />
    </StyledRowWrapper>
  );
};

export default React.memo(BookRow);
