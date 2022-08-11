import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { BookType } from '@/models/books';
import {
  StyledBookInfo,
  StyledIconWrapper,
  StyledTitle,
  StyledWrapper
} from './styles';
import Audio from '@/components/Common/Icons/Audio';
import Book2 from '@/components/Common/Icons/Book2';
import Digital from '@/components/Common/Icons/Digital';
import Book from '@/components/Common/Icons/Book';
import Price from '@/components/Common/Price';
import Cart from '@/components/Common/Icons/Cart';
import IconButton from '@/components/Common/IconButton';

interface BookTypeCardProps extends ClassNameProps {
  readonly id: number;
  readonly type: BookType;
  readonly price: number;
}

const nameMap: Record<BookType, string> = {
  audio: 'АУДИОКНИГА',
  book2: 'КНИГА 2.0',
  digital: 'ЦИФРОВОЕ ИЗДАНИЕ',
  write: 'ПЕЧАТНОЕ ИЗДАНИЕ',
};

const iconMap: Record<BookType, React.ReactElement> = {
  audio: <Audio />,
  book2: <Book2 />,
  digital: <Digital />,
  write: <Book />,
};

const BookTypeCard: React.FC<BookTypeCardProps> = (props) => {
  const { id, price, type, ...rest } = props;
  return (
    <StyledWrapper {...rest}>
      <StyledTitle>{nameMap[type]}</StyledTitle>
      <StyledIconWrapper>{iconMap[type]}</StyledIconWrapper>
      <StyledBookInfo>
        <Price price={price} />
        <IconButton onClick={() => console.log(id)}>
          <Cart />
        </IconButton>
      </StyledBookInfo>
    </StyledWrapper>
  );
};

export default React.memo(BookTypeCard);
