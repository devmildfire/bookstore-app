import React, { FC } from 'react';
// import { Book } from '@/models/books';
import {
  StyledAuthor,
  StyledBookName,
  StyledButton,
  StyledImage,
  StyledWrapper,
} from './styles';
// import getAuthorNames from '@/utils/getAuthorNames';

type ProductCardProps = {
  cover: string;
  title: string;
  authors: string[];
  id: number;
};

const ProductCard: FC<ProductCardProps> = (props): React.ReactElement => {
  const { cover, authors, title, id } = props;
  // const authorNames = getAuthorNames(authors);
  const authorNames = authors.join(', ');
  return (
    <StyledWrapper>
      <StyledImage src={cover} />
      <StyledBookName component='h2' variant='h1' textColor='red'>
        {title}
      </StyledBookName>
      <StyledAuthor variant='h3_1' textColor='white'>
        {authorNames}
      </StyledAuthor>
      <StyledButton href={`/books/${id}`}>Познать</StyledButton>
    </StyledWrapper>
  );
};

export default ProductCard;
