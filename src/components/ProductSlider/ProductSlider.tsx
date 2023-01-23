import React from 'react';
import ProductCard from './ProductCard/ProductCard';
import Slide from '@/components/Common/Slide';
import Container from '@/components/Common/Container';
import { StyledSlider } from './styles';
import DDbanner from '../../../public/images/banners/dostoevskie-dni-banner(2).png';
// import { useGetPopularBooksQuery } from '@/models/books';

const books = [
  {
    cover: DDbanner.src,
    title: 'Достоевские Дни',
    authors: ['Оганес Мартиросян'],
    id: 1,
  },
  {
    cover: DDbanner.src,
    title: 'Достоевские Дни',
    authors: ['Оганес Мартиросян'],
    id: 2,
  },
];

const ProductSlider = () => {
  // const { data: books = [], } = useGetPopularBooksQuery(undefined);
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
