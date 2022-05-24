import React, { useContext, useMemo } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import breakPoints from '@/utils/breakPoints';
import booksData from '@/utils/booksData';
import DeviceInfoContext from '@/contexts/DeviceInfoContext';
import Slide from '../Common/Slide';
import Slider from '../Common/Slider';
import Text from '../Common/Text';

const Title = styled(Text)`
  margin-bottom: 50px;
`;

const BooksList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;

  .swiper-slide {
    text-align: center;
  }

  .mySwiper {
    @media ${breakPoints.sm} {
      margin: 0 -60px;
    }
  }
`;

const BookItem = styled.li`
  flex: 0 0 18.5%;
`;

const Banner = styled.img`
  width: 100%;
  height: 387px;

  @media ${breakPoints.xl} {
    height: 288.5px;
  }

  @media ${breakPoints.lg} {
    height: 228.5px;
  }

  @media ${breakPoints.md} {
    width: 120px;
    height: 190px;
  }

  @media screen and (max-width: 700px) {
    width: auto;
    height: auto;
  }
`;

const SimilarBooks = (): React.ReactElement => {
  const { isTabletVertical, isMobile } = useContext(DeviceInfoContext);
  const books = useMemo(() => booksData.slice(0, 5), [booksData]);

  return (
    <section>
      <Title component='h2' fontFamily='serif' align='center'>
        Познайте также
      </Title>
      <BooksList>
        {isTabletVertical || isMobile ? (
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
                    <Banner src={book.link} alt={book.title} />
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
                  <Banner src={book.link} alt={book.title} />
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
