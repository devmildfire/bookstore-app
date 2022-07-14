import React from 'react';
import ProductCard from './ProductCard/ProductCard';
import { useGetBooksQuery } from '@/models/books';
import Container from '@/components/Common/Container';
import Slide from '@/components/Common/Slide';
import { StyledSlider } from './styles';

const ProductSlider = () => {
  const { data: books = [] } = useGetBooksQuery(undefined);
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
