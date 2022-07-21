import * as React from 'react';
import { Book } from '@/models/books';
import { StyledImage, StyledText, StyledWrapper } from './styles';
import getAuthorNames from '@/utils/getAuthorNames';
import Text from '@/components/Common/Text';

interface BookCardProps
  extends Pick<Book, 'id' | 'authors' | 'title' | 'image'> {}

const BookCard: React.FC<BookCardProps> = (props) => {
  const {
    authors, id, title, image,
  } = props;
  const author = getAuthorNames(authors);
  return (
    <StyledWrapper href={`/books/${id}`}>
      <StyledImage src={image} alt={title} />
      <StyledText>
        <Text variant='p' fontWeight={700}>
          {title}
        </Text>
        <Text variant='span'>{author}</Text>
      </StyledText>
    </StyledWrapper>
  );
};

export default React.memo(BookCard);
