import React, { useContext } from 'react';
import Link from 'next/link';
import { DeviceInfoContext } from '@/contexts/DeviceInfoContext';
import Slide from '@/components/Common/Slide';
import Slider from '@/components/Common/Slider';
import {
  Banner, BookItem, BooksList, Title,
} from './styles';
import { useGetBooksQuery } from '@/models/books';

const SimilarBooks = (): React.ReactElement => {
  const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  const { data: books = [] } = useGetBooksQuery({ count: 5 });
  const isSlider = isTabletVertical || isMobile;

  return (
    <section>
      <Title variant='h2_1' align='center'>
        Познайте также
      </Title>
      <BooksList>
        {isSlider ? (
          <Slider
            className='mySwiper'
            slidesPerView={3}
            spaceBetween={20}
            withoutPagination
          >
            {books.map((book) => (
              <Slide key={book.id}>
                <Link href={`/books/${book.id}`} passHref>
                  <a href='fakePath'>
                    <Banner src={book.image} alt={book.title} />
                  </a>
                </Link>
              </Slide>
            ))}
          </Slider>
        ) : (
          books.map((book) => (
            <BookItem>
              <Link href={`/books/${book.id}`} passHref>
                <a href='fakePath'>
                  <Banner src={book.image} alt={book.title} />
                </a>
              </Link>
            </BookItem>
          ))
        )}
      </BooksList>
    </section>
  );
};

export default SimilarBooks;
