import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
const ImagePopup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  visibility: visible;
  opacity: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  background-color: #000000d6;
`;

const FullscreenCover = styled.img`
  width: auto;
  height: 100%;
`;

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
  useEffect(() => {
    // const handleClickOutside = (e) => {
    //   if (isImageOpen && popupRef.current === e.target) {
    //     setIsImageOpen(false);
    //   }
    //   console.log(isImageOpen);
    // };
    // // if (isImageOpen) {
    // //   document.body.style.overflow = 'hidden';
    // // } else {
    // //   document.body.style.overflow = 'unset';
    // // }
    // document.addEventListener('click', handleClickOutside);
    // return document.addEventListener('click', handleClickOutside);
  }, [isImageOpen]);

  return (
    <StyledWrapper>
      {isImageOpen ? (
        <ImagePopup
          onClick={() => {
            document.body.style.overflow = 'unset';
            setIsImageOpen(false);
          }}
        >
          <FullscreenCover src={image} alt={title} />
        </ImagePopup>
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
