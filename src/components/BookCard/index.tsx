import React from 'react';
import styled from 'styled-components';
import { BooksData } from '../../types/api';

type BookCardProps = {
  book: BooksData
}

const BookCard = ({ book }: BookCardProps): React.ReactElement => {
  const {
    link,
    title,
    genre,
    price,
    author,
    ageRestriction,
    yearOfPublication,
  } = book;

  return (
    <StyledWrapper>
      <img
        className='cardImage'
        src={link}
        alt='Book logo'
      />
      <div
        className='cardTitle'
      >
        {title}
      </div>
      <div
        className='cardAuthor'
      >
        {author}
      </div>
      <div className='cardInfo'>
        <div>
          {`${yearOfPublication} | ${genre} | ${ageRestriction}`}
        </div>
        <div
          className='cardPrice'
        >
          {`${price}₽`}
        </div>
      </div>
      <button
        type='button'
        className='cardButtonBuy'
      >
        Добавить в  корзину
      </button>
    </StyledWrapper>
  );
};

export default BookCard;

const StyledWrapper = styled.div`
  font-size: 16px;
  line-height: 20px;
  color: #F5F5F5;

  .cardImage {
    margin: 0 auto;
    border-radius: 6px;
  }

  .cardTitle {
    font-weight: bold;
    font-size: 20px;
    line-height: 24px;
    margin-top: 35px;
  }

  .cardAuthor {
    margin: 15px 0 5px 0;
  }

  .cardInfo {
    display: flex;
    justify-content: space-between;
  }

  .cardPrice {
    font-size: 20px;
    font-weight: bold;
    line-height: 24px;
  }

  .cardButtonBuy {
    width: 320px;
    height: 70px;
    color: #FFFFFF;
    margin-top: 50px;

    background: transparent;
    border: 1px solid #FFFFFF;
    border-radius: 10px;

    cursor: pointer;
  }
`;
