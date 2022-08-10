import * as React from 'react';
import { Book } from '@/models/books';
import { StyledImage, StyledText, StyledWrapper } from './styles';
import getAuthorNames from '@/utils/getAuthorNames';
import Text from '@/components/Common/Text';

type SetBookCardProps = Pick<Book, 'id' | 'authors' | 'title' | 'image'>

const SetBookCard: React.FC<SetBookCardProps> = (props) => {
  const {
    authors, id, title, image,
  } = props;
  const author = getAuthorNames(authors);
  return (
    <StyledWrapper href={`/books/${id}`}>
      <StyledImage src={image} alt={title} />
      <StyledText>
        <Text component='p' variant='h3_3'>
          {title}
        </Text>
        <Text variant='text'>{author}</Text>
      </StyledText>
    </StyledWrapper>
  );
};

export default React.memo(SetBookCard);
