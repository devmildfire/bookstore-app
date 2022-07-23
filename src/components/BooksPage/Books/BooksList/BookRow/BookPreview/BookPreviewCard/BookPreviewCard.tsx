import * as React from 'react';
import dayjs from 'dayjs';
import getAuthorNames from '@/utils/getAuthorNames';
import {
  StyledBackground,
  StyledButton,
  StyledDescription,
  StyledForwardPlan,
  StyledPlayer,
  StyledShadowElement,
  StyledTextBlock,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import { Book } from '@/models/books';

interface BookPreviewCardProps
  extends Pick<
    Book,
    | 'id'
    | 'title'
    | 'publishDate'
    | 'genre'
    | 'ageRestriction'
    | 'description'
    | 'trailerSrc'
    | 'authors'
    | 'image'
  > {}

const BookPreviewCard: React.FC<BookPreviewCardProps> = (props) => {
  const {
    ageRestriction,
    authors,
    description,
    genre,
    id,
    image,
    publishDate,
    title,
    trailerSrc,
  } = props;
  const authorNames = getAuthorNames(authors);
  return (
    <StyledWrapper>
      <StyledForwardPlan>
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
          <StyledButton href={`/books/${id}`}>Познать</StyledButton>
        </StyledTextBlock>
      </StyledForwardPlan>
      <StyledBackground>
        <div />
        <StyledPlayer src={trailerSrc} fallbackSrc={image} autoPlay>
          <StyledShadowElement />
        </StyledPlayer>
      </StyledBackground>
    </StyledWrapper>
  );
};

export default React.memo(BookPreviewCard);
