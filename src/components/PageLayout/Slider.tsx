import React from 'react';
import styled from 'styled-components';
import Carousel from 'nuka-carousel';

import { BooksData } from '../../types/api';

type SliderProps = {
  books: BooksData[]
}

const Slider = React.memo(({ books }: SliderProps) => {
  if (!books || books.length === 0) return null;
  return (
    <StyleWrapper>
      <div
        className='wrap'
      >
        <Carousel
          className='sliderContainer'
          autoplay={books.length > 1}
          autoplayInterval={5000}
          wrapAround
          heightMode='max'
        >
          {books.map((b) => (
            <>
              <img
                className='sliderImage'
                src={b.link}
                alt='Book logo'
              />
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
                  className='button buttonBuy'
                >
                  Купить
                </button>
              </div>

            </>
          ))}
        </Carousel>
      </div>
    </StyleWrapper>
  );
});

export default Slider;

// Styles
const StyleWrapper = styled.div`
  .wrap {
    max-width: 900px;
    height: 45vw;
    margin: 0 auto;
    margin-top: 95px;
    margin-bottom: 60px;
    z-index: 100;
  }

  .sliderContainer {
    width: 100%;
    height: 100%;
  }

  .sliderImage {
    margin: 0 auto;
    border-radius: 10px;
    max-width: 350px;
  }

  .buttonBlock {
    display: flex;
    justify-content: space-between;
    max-width: 330px;
    margin: 0 auto;
    margin-top: 42px;
    margin-bottom: 77px;
    .button {
      width: 150px;
      height: 50px;
      background: transparent;
      border: 1px solid #FFFFFF;
      color: #FFFFFF;
    }

    .buttonBuy {
      color: #A10202;
    }
  }
`;
