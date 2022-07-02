import React from 'react';
import styled from 'styled-components';
import { Book } from '@/types/book';
import Slider from '../Common/Slider';
import Slide from '../Common/Slide';
import Button from '../Common/Button';

interface BooksSliderProps {
  readonly books: Book[];
}

const BooksSlider = ({ books }: BooksSliderProps) => {
  if (!books || books.length === 0) return null;

  return (
    <Slider
      className='mySwiper'
      additionComponents={(
        <StyledButtonBlock>
          <StyledButton type='button' variant='narrow' rounded>
            Познать
          </StyledButton>
          <StyledButton type='button' variant='narrow' rounded>
            Купить
          </StyledButton>
        </StyledButtonBlock>
      )}
    >
      {books.map((book) => (
        <Slide key={book.id}>
          <img
            className='sliderImage'
            src={book.banner}
            alt='BookDescription logo'
          />
        </Slide>
      ))}
    </Slider>
  );
};

export default React.memo(BooksSlider);

// Styles

const StyledButtonBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 330px;
  margin: 0 auto;
`;

const StyledButton = styled(Button)`
  border: 1px solid #dcdcdc;

  &:hover {
    color: var(--red);
    border: 0.5px solid rgb(220 220 220 / 50%);
    background-color: var(--black);
  }
`;
