import * as React from 'react';
import Button from '@/components/Common/Button';
import BookTypesList from './BookTypesList';
import { StyledWrapper } from './styles';
import { BookType } from '@/models/books';
import { ClassNameProps } from '@/types/className';

interface BookInfoProps extends ClassNameProps {
  readonly id: number;
  readonly price: number;
  readonly types: BookType[];
}

const BookInfo: React.FC<BookInfoProps> = (props) => {
  const { id, price, types, ...rest } = props;
  return (
    <StyledWrapper {...rest}>
      <BookTypesList id={id} price={price} types={types} />
      <Button href={`/books/${id}`}>Страница книги</Button>
    </StyledWrapper>
  );
};

export default React.memo(BookInfo);
