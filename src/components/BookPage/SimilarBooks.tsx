import React, { useContext } from 'react';
import Link from 'next/link';
// eslint-disable-next-line import/no-unresolved
import { Swiper, SwiperSlide } from 'swiper/react';
import styled from 'styled-components';
import breakPoints from '../../utils/breakPoints';
import booksData from '../../utils/booksData';
import DeviceInfoContext from '../../contexts/DeviceInfoContext';

const params = {
  slidesPerView: 3,
  spaceBetween: 20,
  loop: true,
};

const Title = styled.h2`
  margin-bottom: 50px;
  text-align: center;
  font-family: Cheque;
  font-style: normal;
  font-weight: 900;
  font-size: 44px;
  line-height: 53px;

  @media ${breakPoints.lg} {
    font-size: 40px;
    line-height: 48px;
  }

  @media ${breakPoints.sm} {
    font-size: 24px;
    line-height: 28px;
  }
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
  const { isTabletVertical } = useContext(DeviceInfoContext);

  return (
    <section>
      <Title>Познайте также</Title>
      <BooksList>
        {isTabletVertical ? (
          <Swiper className='mySwiper' {...params}>
            {booksData.map((book, index) => {
              if (index < 5) {
                return (
                  <SwiperSlide key={book.id}>
                    <Link href={`/books/${book.id}`}>
                      <a href='fakeHref'>
                        <Banner src={book.link} alt={book.title} />
                      </a>
                    </Link>
                  </SwiperSlide>
                );
              }
              return null;
            })}
          </Swiper>
        ) : (
          booksData.map((book, index) => {
            if (index < 5) {
              return (
                <BookItem>
                  <Link href={`/books/${book.id}`}>
                    <a href='fakeHref'>
                      <Banner src={book.link} alt={book.title} />
                    </a>
                  </Link>
                </BookItem>
              );
            }
            return null;
          })
        )}
      </BooksList>
    </section>
  );
};

export default SimilarBooks;
