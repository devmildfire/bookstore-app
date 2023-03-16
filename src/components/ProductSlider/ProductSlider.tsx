import React from 'react';
import ProductCard from './ProductCard/ProductCard';
import Slide from '@/components/Common/Slide';
import { StyledSlider } from './styles';
import DDbanner from '../../../public/images/banners/dostoevskie-dni-banner(2).png';
// import { useGetPopularBooksQuery } from '@/models/books';

const books = [
  {
    cover: DDbanner.src,
    title: 'Достоевские Дни',
    thesis: 'От Москвы до Рязани, от любви до каббалы',
    authors: ['Оганес Мартиросян'],
    id: 1,
  },
  {
    cover: DDbanner.src,
    title: 'Достоевские Дни',
    thesis: 'От Москвы до Рязани, от любви до каббалы',
    authors: ['Оганес Мартиросян'],
    id: 2,
  },
];

const ProductSlider = () => {
  // const { data: books = [] } = useGetPopularBooksQuery(undefined);
  return (
    // <Container>
    <StyledSlider speed={5000} duration={5000}>
      {books.map((book) => (
        <Slide key={book.id}>
          <ProductCard {...book} />
        </Slide>
      ))}
    </StyledSlider>
    // </Container>
  );
};

export default React.memo(ProductSlider);
