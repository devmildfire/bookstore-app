import * as React from 'react';
import { Book } from '@/models/books';
import {
  StyledIcon,
  StyledIconsList,
  StyledImage,
  StyledText,
  StyledWrapper,
} from './styles';
import getAuthorNames from '@/utils/getAuthorNames';
import Text from '@/components/Common/Text';
import { ClassNameProps } from '@/types/className';
import IconButton from '@/components/Common/IconButton';
import { bookTypeIconMap } from '@/consts/products';

interface SetBookCardProps
  extends Pick<Book, 'id' | 'authors' | 'title' | 'cover' | 'types'>,
    ClassNameProps {}

const SetBookCard: React.FC<SetBookCardProps> = (props) => {
  const { authors, id, title, cover, types, className } = props;
  const author = getAuthorNames(authors);
  return (
    <StyledWrapper className={className} href={`/books/${id}`}>
      <StyledImage src={cover} alt={title} />
      <StyledText>
        <Text component='p' variant='h3_3' color='inherit'>
          {title}
        </Text>
        <Text variant='text' color='inherit'>
          {author}
        </Text>
        <StyledIconsList />
      </StyledText>
    </StyledWrapper>
  );
};

export default React.memo(SetBookCard);
