import React from 'react';
import {
  StyledAuthor,
  StyledDescription,
  StyledImage,
  StyledInfo,
  StyledThesis,
  StyledTitle,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';

interface BookDescriptionProps {
  readonly title: string;
  readonly author: string | null;
  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;
  readonly link: string;
  readonly description: string[];
  readonly authors: string[] | null;
}

const BookDescription = (props: BookDescriptionProps): React.ReactElement => {
  const {
    title,
    author,
    publishDate,
    genre,
    ageRestriction,
    link,
    description,
    authors,
  } = props;

  return (
    <StyledWrapper>
      <StyledImage src={link} alt={title} />
      <div>
        <StyledTitle variant='h2'>{title}</StyledTitle>
        <StyledAuthor variant='p' component='h3' fontWeight={700}>
          {author || authors}
        </StyledAuthor>
        <StyledInfo fontWeight={700}>
          {`${publishDate} | ${genre} | ${ageRestriction}`}
        </StyledInfo>
        <StyledThesis variant='p' color='red' fontWeight={500}>
          ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ, МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
        </StyledThesis>
        <StyledDescription>
          {description.map((paragraph: string) => (
            <Text variant='p'>{paragraph}</Text>
          ))}
        </StyledDescription>
      </div>
    </StyledWrapper>
  );
};

export default BookDescription;
