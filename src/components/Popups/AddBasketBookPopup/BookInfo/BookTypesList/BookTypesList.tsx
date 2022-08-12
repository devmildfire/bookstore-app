import * as React from 'react';
import { BookType } from '@/models/books';
import { StyledList } from './styles';
import { ClassNameProps } from '@/types/className';
import BookTypeCard from './BookTypeCard';

interface BookTypesListProps extends ClassNameProps {
  readonly id: number;
  readonly price: number;
  readonly newPrice?: number | null;
  readonly types: BookType[];
}

const BookTypesList: React.FC<BookTypesListProps> = (props) => {
  const { id, price, types, newPrice, ...rest } = props;
  return (
    <StyledList {...rest}>
      {types.map((type) => (
        <BookTypeCard
          id={id}
          type={type}
          price={price}
          newPrice={newPrice}
          key={type}
        />
      ))}
    </StyledList>
  );
};

export default React.memo(BookTypesList);
