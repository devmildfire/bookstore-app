import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import BookCard from '@/components/BookCard';
import booksData from '@/utils/booksData';

const NewProduct = (): React.ReactElement => (
  <StyleWrapper>
    <h2 className='newProductTitle'>КНИЖНАЯ ЛАВКА</h2>
    <div className='newProducts'>
      {booksData.map((book) => (
        <BookCard book={book} />
      ))}
    </div>
    <div className='buttonContainer'>
      <Link href='/' passHref>
        <button
          type='button'
          className='toBookStoreButton'
        >
          <a href='fakeHref'>На главную</a>
        </button>
      </Link>
    </div>
  </StyleWrapper>
);

export default NewProduct;

const StyleWrapper = styled.div`
  .newProductTitle {
    display: flex;
    justify-content: center;
    margin: 50px 0 80px;
    font-family: Cheque;
    font-style: normal;
    font-weight: 900;
    font-size: 60px;
    text-transform: uppercase;
    line-height: 72px;
    color: #DCDCDC;
  }

  .newProducts {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(320px,1fr));
    grid-column-gap: 219px;
    grid-row-gap: 100px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .buttonContainer {
    display: flex;
    justify-content: center;
    margin-bottom: 200px;

    .toBookStoreButton {
      width: 320px;
      height: 70px;
      color: #FFFFFF;
      margin-top: 100px;

      background: transparent;
      border: 1px solid #FFFFFF;
      border-radius: 4px;
      cursor: pointer;
      transition: all .2s ease-out;

      &:hover {
        color: #930000;
        border: .5px solid rgb(220 220 220 / 50%);
      }
    }
  }
`;
