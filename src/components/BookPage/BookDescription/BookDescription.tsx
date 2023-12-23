import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
import CloseIcon from '@/assets/icons/close.svg';
import Text from '@/components/Common/Text';
import { Author } from '@/types/author';
import breakPoints from '@/utils/breakPoints';

interface BookDescriptionProps {
  readonly title: string;
  readonly publishDate: string;
  readonly genre: string;
  readonly ageRestriction: string;
  readonly cover?: string;
  readonly description: string[];
  readonly authors: Author[];
  readonly thesis?: string;
}
/* grid-template-rows: repeat(auto-fill, min-content); */

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
  @media ${breakPoints.md} {
    top: 12px;
    right: 12px;
  }
`;

const StyledCloseIcon = styled(CloseIcon)`
  width: 36px;
  height: 36px;
  @media ${breakPoints.md} {
    width: 24px;
    height: 24px;
  }
`;

const BookDescription = (props: BookDescriptionProps): React.ReactElement => {
  const {
    title,
    publishDate,
    genre,
    ageRestriction,
    cover,
    description,
    authors,
    thesis,
  } = props;

  const [isImageOpen, setIsImageOpen] = useState(false);
  const year = new Date(publishDate).getFullYear();

  const handleClosePopup = () => {
    // document.body.style.overflow = 'unset';
    setIsImageOpen(false);
  };

  const handleOpenPopup = () => {
    // document.body.style.overflow = 'hidden';
    setIsImageOpen(true);
  };

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        handleClosePopup();
      }
    }
    document.addEventListener('keydown', (e) => handleEsc(e));
    return document.removeEventListener('keydown', (e) => handleEsc(e));
  }, []);

  return (
    <StyledWrapper>
      <CoverPopup
        onClick={handleClosePopup}
        className={isImageOpen ? 'active' : ''}
      >
        <CloseButton onClick={handleClosePopup}>
          <StyledCloseIcon />
        </CloseButton>
        <FullscreenCover
          className={isImageOpen ? 'active' : ''}
          src={cover}
          alt={title}
        />
      </CoverPopup>

      <StyledImage onClick={handleOpenPopup} src={cover} alt={title} />
      <DescriptionLayout>
        <StyledTitle variant='h2_1'>{title}</StyledTitle>
        <StyledAuthor variant='h3_2' component='h3' fontWeight={700}>
          {/* {authors.map((author) => author.name)} */}
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
          {/* {description.map((paragraph: string) => (
            <Text
              key={paragraph}
              variant='text'
              component='p'
              fontWeight={400}
              textTransform='none'
            >
              {paragraph}
            </Text>
          ))} */}
        </StyledDescription>
      </DescriptionLayout>
    </StyledWrapper>
  );
};

export default BookDescription;
