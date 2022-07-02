import React from 'react';
import { Book } from '@/types/book';
import Slider from '../Common/Slider';
import ProductSlide from './ProductSlide/ProductSlide';

interface ProductSliderProps {
  readonly books: Book[];
}

const ProductSlider = ({ books }: ProductSliderProps) => {
  if (!books || books.length === 0) return null;

  return (
    <Slider className='mySwiper'>
      {books.map((book) => (
        <ProductSlide {...book} key={book.id} />
      ))}
    </Slider>
  );
};

export default React.memo(ProductSlider);
