import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { BookType } from '@/models/books';
import {
  StyledBookInfo,
  StyledIconWrapper,
  StyledTitle,
  StyledWrapper
} from './styles';
import Price from '@/components/Common/Price';
import useToggle from '@/hooks/useToggle';
import { bookTypeNameMap, bookTypeIconMap } from '@/consts/products';

interface BookTypeCardProps extends ClassNameProps {
  readonly id: number;
  readonly type: BookType;
  readonly price: number;
  readonly newPrice?: number | null;
}

const BookTypeCard: React.FC<BookTypeCardProps> = (props) => {
  const { price, newPrice, type, ...rest } = props;

  const { toggleOff, toggleOn, value, } = useToggle();
  const onClick = value ? toggleOff : toggleOn;
  const Icon = bookTypeIconMap[type];
  return (
    <StyledWrapper {...(rest as any)}>
      <StyledTitle>{bookTypeNameMap[type]}</StyledTitle>
      <StyledIconWrapper onClick={onClick} isActive={value}>
        <Icon />
      </StyledIconWrapper>
      <StyledBookInfo>
        <Price price={price} newPrice={newPrice} />
      </StyledBookInfo>
    </StyledWrapper>
  );
};

export default React.memo(BookTypeCard);
