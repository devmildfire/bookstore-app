import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// eslint-disable-next-line import/no-unresolved
import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line import/no-unresolved
import 'swiper/css';
import styled from 'styled-components';
import booksData from '../../utils/booksData';

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
  
  @media screen and (max-width: 1024px) {
    font-size: 40px;
    line-height: 48px;
  }
  
  @media screen and (max-width: 576px) {
    font-size: 24px;
    line-height: 28px;
  }
`;

const BooksList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content:space-between;
  position: relative;
  
  .swiper-slide {
    text-align: center;
  }
`;

const BookItem = styled.li`
  flex: 0 0 18.5%;  
`;

const Banner = styled.img`
  width: 100%;
  height: 387px;
  
  @media screen and (max-width: 1440px) {
    height: 288.5px;
  }
  
  @media screen and (max-width: 1024px) {
    height: 228.5px;
  }
  
  @media screen and (max-width: 830px) {
    width: 120px;
    height: 190px;
  }
  
  @media screen and (max-width: 700px) {
    width: auto;
    height: auto;
  }
`;

const SimilarBooks = (): React.ReactElement => {
  const [isSliderActive, setIsSliderActive] = useState(false);
  const resizeHandler = () => {
    if (window.innerWidth < 700) {
      setIsSliderActive(true);
    }
    if (window.innerWidth > 700) {
      setIsSliderActive(false);
    }
  };
  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);
  return (
    <section>
      <Title>
        Познайте также
      </Title>
      <BooksList>
        {!isSliderActive && booksData.map((book, index) => {
          if (index < 5) {
            return (
              <BookItem>
                <Link href={`/books/${book.id}`}>
                  <a href='fakeHref'>
                    <Banner
                      src={book.link}
                      alt={book.title}
                    />
                  </a>
                </Link>
              </BookItem>
            );
          }
          return null;
        })}
        {isSliderActive
          && (
            <Swiper
              className='mySwiper'
              {...params}
            >
              {booksData.map((book, index) => {
                if (index < 5) {
                  return (
                    <SwiperSlide key={book.id}>
                      <Link href={`/books/${book.id}`}>
                        <a href='fakeHref'>
                          <Banner
                            src={book.link}
                            alt={book.title}
                          />
                        </a>
                      </Link>
                    </SwiperSlide>
                  );
                }
                return null;
              })}
            </Swiper>
          )}
      </BooksList>
    </section>
  );
};

export default SimilarBooks;
