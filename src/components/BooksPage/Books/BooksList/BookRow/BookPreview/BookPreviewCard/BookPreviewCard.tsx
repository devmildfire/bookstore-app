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
  StyledWrapper
} from './styles';
import Text from '@/components/Common/Text';
import { Book } from '@/models/books';

type BookPreviewCardProps = Pick<
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
>;

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
          <Text variant='h2_2'>{title}</Text>
          <Text variant='h3_4' textTransform='none'>
            {authorNames}
          </Text>
          <Text
            variant='h4_1'
            component='p'
            textColor='red'
            textTransform='uppercase'
          >
            adfasdfadfasdfasdf
          </Text>
          <Text variant='h4_1' component='p'>
            {`${dayjs(publishDate).get('year')} | ${genre} | ${ageRestriction}`}
          </Text>
          <StyledDescription>
            {description.map((p) => (
              <Text variant='h4_1' component='p' key={p}>
                {p}
              </Text>
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
