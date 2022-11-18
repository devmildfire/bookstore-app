import React, { useState } from 'react';
import {
  DescriptionLayout,
  FullscreenCover,
  CoverPopup,
  StyledAuthor,
  StyledDescription,
  StyledImage,
  StyledInfo,
  StyledThesis,
  StyledTitle,
  StyledWrapper,
} from './styles';
import Text from '@/components/Common/Text';
import { Author } from '@/types/author';

interface BookDescriptionProps {
  readonly title: string;
  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;
  readonly image?: string;
  readonly description: string[];
  readonly authors: Author[];
  readonly thesis?: string;
}
/* grid-template-rows: repeat(auto-fill, min-content); */

const BookDescription = (props: BookDescriptionProps): React.ReactElement => {
  const {
    title,
    publishDate,
    genre,
    ageRestriction,
    image,
    description,
    authors,
    thesis,
  } = props;

  const [isImageOpen, setIsImageOpen] = useState(false);
  const year = new Date(publishDate).getFullYear();

  return (
    <StyledWrapper>
      {isImageOpen ? (
        <CoverPopup
          onClick={() => {
            document.body.style.overflow = 'unset';
            setIsImageOpen(false);
          }}
        >
          <FullscreenCover src={image} alt={title} />
        </CoverPopup>
      ) : null}
      <StyledImage
        onClick={() => {
          document.body.style.overflow = 'hidden';
          setIsImageOpen(true);
        }}
        src={image}
        alt={title}
      />
      <DescriptionLayout>
        <StyledTitle variant='h2_1'>{title}</StyledTitle>
        <StyledAuthor variant='h3_2' component='h3' fontWeight={700}>
          {authors.map((author) => author.name)}
        </StyledAuthor>
        <StyledInfo variant='h4_1' component='p' fontWeight={700}>
          {`${year} | ${genre} | ${ageRestriction}`}
        </StyledInfo>
        <StyledThesis
          variant='h3_3'
          component='p'
          textColor='red'
          fontWeight={500}
        >
          {thesis}
        </StyledThesis>
        <StyledDescription>
          {description.map((paragraph: string) => (
            <Text
              variant='text'
              component='p'
              fontWeight={400}
              textTransform='none'
            >
              {paragraph}
            </Text>
          ))}
        </StyledDescription>
      </DescriptionLayout>
    </StyledWrapper>
  );
};

export default BookDescription;
