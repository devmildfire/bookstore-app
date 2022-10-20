import React from 'react';
import {
  DescriptionLayout,
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
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import useScreenSize from '@/hooks/useScreenSize';

interface BookDescriptionProps {
  readonly title: string;
  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;
  readonly image?: string;
  readonly description: string[];
  readonly authors: Author[];
}
/* grid-template-rows: repeat(auto-fill, min-content); */

const BookDescription = (props: BookDescriptionProps): React.ReactElement => {
  const [width] = useScreenSize();
  const {
    title,
    publishDate,
    genre,
    ageRestriction,
    image,
    description,
    authors,
  } = props;

  const year = new Date(publishDate).getFullYear();
  const images = [image, image, image, image];

  console.log(width);

  return (
    <StyledWrapper>
      <Slider withoutAutoplay withoutPagination={width <= 576}>
        {images.map((img) => (
          <Slide>
            <StyledImage src={img} alt={title} />
          </Slide>
        ))}
      </Slider>
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
          ЕСЛИ ВЫ НЕ УСПЕЛИ ПОПРОЩАТЬСЯ С БАБУЛЕЙ, МЫ ПЕРЕДАДИМ ВАШЕ СООБЩЕНИЕ
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
