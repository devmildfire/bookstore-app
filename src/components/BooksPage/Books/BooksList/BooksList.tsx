import React from 'react';
import { StyledProductsList, StyledRowWrapper } from './styles';
import BookCard from './BookCard';
import useTypedSelector from '@/hooks/useTypedSelector';
import { Book, selectBooks } from '@/models/books';
import BookCardPreview from './BookCardPreview';
import separateOnRow from '@/utils/separateOnRow';
import Row from './Row';

const BooksList = (): React.ReactElement => {
  const books = useTypedSelector(selectBooks);
  const separatedBooks: Book[][] = separateOnRow(books, 3);
  return (
    <StyledProductsList>
      {separatedBooks.map((row) => (
        <StyledRowWrapper>
          <Row>
            {row.map((book) => (
              <BookCard {...book} key={book.id} />
            ))}
          </Row>
          <BookCardPreview allowedId={row.map((book) => book.id)} />
        </StyledRowWrapper>
      ))}
    </StyledProductsList>
  );
};

export default BooksList;
