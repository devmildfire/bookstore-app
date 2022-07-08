import * as React from 'react';
import dayjs from 'dayjs';
import usePrepareLink from '@/hooks/usePrepareLink';
import useScrollTo from '@/hooks/useScrollTo';
import getAuthorNames from '@/utils/getAuthorNames';
import {
  StyledButton,
  StyledDescription,
  StyledTextBlock,
  StyledTrailer,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import useTypedSelector from '@/hooks/useTypedSelector';
import { selectBook } from '@/models/books';

interface BookCardPreviewInfoProps {
  readonly bookId: number;
}

const BookCardPreviewInfo: React.FC<BookCardPreviewInfoProps> = (props) => {
  const { bookId } = props;
  const book = useTypedSelector((state) => selectBook(state, bookId));
  const [ref, setRef] = React.useState<HTMLElement | null>(null);
  const id = book?.id;
  const path = usePrepareLink({ to: `/books/${id}` });
  useScrollTo(ref);
  if (!book) {
    return null;
  }
  const {
    title,
    publishDate,
    genre,
    ageRestriction,
    description,
    trailerSrc,
    authors,
  } = book;
  const authorNames = getAuthorNames(authors);
  return (
    <StyledWrapper ref={setRef}>
      <StyledTextBlock>
        <Text variant='h2'>{title}</Text>
        <Text variant='p' component='h3'>
          {authorNames}
        </Text>
        <Text variant='body1' color='red' textTransform='uppercase'>
          adfasdfadfasdfasdf
        </Text>
        <Text variant='body1'>
          {`${dayjs(publishDate).get('year')}|${genre}|${ageRestriction}`}
        </Text>
        <StyledDescription>
          {description.map((p) => (
            <Text key={p}>{p}</Text>
          ))}
        </StyledDescription>
        <StyledButton href={path}>Познать</StyledButton>
      </StyledTextBlock>
      <StyledTrailer data={`${trailerSrc}?controls=0`} />
    </StyledWrapper>
  );
};

export default React.memo(BookCardPreviewInfo);
