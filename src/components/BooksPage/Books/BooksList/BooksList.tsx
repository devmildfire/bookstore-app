import React from 'react';
import {
  StyledPreviewContainer,
  StyledProductsList,
  StyledRowWrapper,
} from './styles';
import BookCard from './BookCard';
import useTypedSelector from '@/hooks/useTypedSelector';
import { Book, selectBooks } from '@/models/books';
import BookCardPreview from './BookCardPreview';
import separateOnRow from '@/utils/separateOnRow';
import Row from './Row';
import Container from '@/components/Common/Container';

const BooksList = (): React.ReactElement => {
  const books = useTypedSelector(selectBooks);
  const separatedBooks: Book[][] = separateOnRow(books, 3);
  return (
    <StyledProductsList>
      {separatedBooks.map((row) => (
        <StyledRowWrapper>
          <Container>
            <Row>
              {row.map((book) => (
                <BookCard {...book} key={book.id} />
              ))}
            </Row>
          </Container>
          <StyledPreviewContainer>
            <BookCardPreview allowedId={row.map((book) => book.id)} />
          </StyledPreviewContainer>
        </StyledRowWrapper>
      ))}
    </StyledProductsList>
  );
};

export default BooksList;
