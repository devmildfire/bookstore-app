import React from 'react';
import ProductCard from './ProductCard/ProductCard';
import Slide from '@/components/Common/Slide';
import Container from '@/components/Common/Container';
import { StyledSlider } from './styles';
import { useGetPopularBooksQuery } from '@/models/books';

const ProductSlider = () => {
  const { data: books = [], } = useGetPopularBooksQuery(undefined);
  return (
    <Container>
      <StyledSlider>
        {books.map((book) => (
          <Slide key={book.id}>
            <ProductCard {...book} />
          </Slide>
        ))}
      </StyledSlider>
    </Container>
  );
};

export default React.memo(ProductSlider);
