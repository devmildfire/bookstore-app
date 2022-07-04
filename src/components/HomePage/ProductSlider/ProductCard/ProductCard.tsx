import React, { FC } from 'react';
import { Book } from '@/models/books';
import {
  StyledAuthor,
  StyledBookName,
  StyledButton,
  StyledImage,
  StyledWrapper,
} from './styles';
import getAuthorNames from '@/utils/getAuthorNames';

interface ProductCardProps extends Book {}

const ProductCard: FC<ProductCardProps> = (props): React.ReactElement => {
  const {
    link, authors, title, id,
  } = props;
  const authorNames = getAuthorNames(authors);
  return (
    <StyledWrapper>
      <StyledImage src={link} />
      <StyledAuthor variant='h3' color='white'>
        {authorNames}
      </StyledAuthor>
      <StyledBookName component='h2' variant='h1' color='red'>
        {title}
      </StyledBookName>
      <StyledButton href={`/books/${id}`} rounded styleVariant='outlined'>
        Познать
      </StyledButton>
    </StyledWrapper>
  );
};

export default ProductCard;
