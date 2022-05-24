import React from 'react';
import styled from 'styled-components';
import SwiperCore, { Autoplay, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { BooksData } from '@/types/api';

type SliderProps = {
  books: BooksData[]
}

SwiperCore.use([Autoplay, Pagination]);

const params = {
  pagination: {
    el: '.pagination',
    clickable: true,
    renderBullet: (index: number, className: string) => `<span class="${className}"></span>`,
  },
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  loop: true,
};

const Slider = React.memo(({ books }: SliderProps) => {
  if (!books || books.length === 0) return null;
  return (
    <StyleWrapper>
      <>
        <Swiper
          className='mySwiper'
          {...params}
        >
          {books.map((book) => (
            <SwiperSlide key={book.id}>
              <img
                className='sliderImage'
                src={book.banner}
                alt='BookDescription logo'
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div
          className='buttonBlock'
        >
          <button
            type='button'
            className='button'
          >
            Познать
          </button>
          <button
            type='button'
            className='button'
          >
            Купить
          </button>
        </div>
        <div className='pagination' />
      </>
    </StyleWrapper>
  );
});

export default Slider;

// Styles
const StyleWrapper = styled.div`
  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    font-size: 22px;
    font-weight: bold;
    color: #fff;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .swiper-pagination-bullet {
    width: 14px;
    height: 14px;
    margin-right: 25px;
    opacity: 1;
    background: #DCDCDC;
  }

  .swiper-pagination-bullet:not(:last-child) {
    margin-right: 20px;
  }

  .swiper-pagination-bullet-active {
    width: 22px;
    height: 22px;
    color: #fff;
    background: #930000;
  }

  .sliderImage {
    margin: 0 auto;
  }

  .buttonBlock {
    display: flex;
    justify-content: space-between;
    max-width: 330px;
    margin: 0 auto;
    margin-top: 42px;
    margin-bottom: 63px;
    .button {
      width: 150px;
      height: 50px;
      background: transparent;
      border: 1px solid #DCDCDC;
      border-radius: 4px;
      color: #DCDCDC;
      transition: all .2s ease-out;

      &:hover {
        color: #930000;
        border: .5px solid rgb(220 220 220 / 50%);
      }
    }
  }
`;
