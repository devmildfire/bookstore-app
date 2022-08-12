import * as React from 'react';
import Button from '@/components/Common/Button';
import BookTypesList from './BookTypesList';
import { StyledTitleWrapper, StyledWrapper } from './styles';
import { BookType } from '@/models/books';
import { ClassNameProps } from '@/types/className';
import { Author } from '@/types/author';
import Text from '@/components/Common/Text';
import getAuthorNames from '@/utils/getAuthorNames';

interface BookInfoProps extends ClassNameProps {
  readonly id: number;
  readonly price: number;
  readonly title: string;
  readonly authors: Author[];
  readonly types: BookType[];
  readonly newPrice?: number | null;
}

const BookInfo: React.FC<BookInfoProps> = (props) => {
  const { id, price, types, newPrice, title, authors, ...rest } = props;
  const subtitle = getAuthorNames(authors);
  return (
    <StyledWrapper {...rest}>
      <StyledTitleWrapper>
        <Text variant='h3_1' textTransform='none' align='center'>
          {title}
        </Text>
        <Text
          variant='h3_2'
          component='p'
          fontWeight={400}
          textTransform='none'
          align='center'
        >
          {subtitle}
        </Text>
      </StyledTitleWrapper>
      <BookTypesList id={id} price={price} newPrice={newPrice} types={types} />
      <Button href={`/books/${id}`}>Страница книги</Button>
    </StyledWrapper>
  );
};

export default React.memo(BookInfo);
