import React from 'react';
import Link from 'next/link';

import styled from 'styled-components';

import BookCard from '../BookCard';
import booksData from '../../utils/booksData';
import Text from '../Common/Text';

// Зачем прокидывать в ссылку еще одну ссылку?
const NewProduct = (): React.ReactElement => (
  <StyleWrapper>
    <Text
      className='newProductTitle'
      component='h2'
      fontFamily='serif'
      align='center'
      textTransform='uppercase'
    >
      НОВИНКИ
    </Text>
    <div className='newProducts'>
      {booksData.map((book) => (
        <BookCard book={book} />
      ))}
    </div>
    <div className='buttonContainer'>
      <Link href='/books' passHref>
        <button type='button' className='toBookStoreButton'>
          <a href='fakeHref'>Перейти в книжную лавку</a>
        </button>
      </Link>
    </div>
  </StyleWrapper>
);

export default NewProduct;

const StyleWrapper = styled.div`
  .newProductTitle {
    margin: 204px 0 80px;
  }

  .newProducts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
      color: #ffffff;
      margin-top: 100px;

      background: transparent;
      border: 1px solid #ffffff;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease-out;

      &:hover {
        color: #930000;
        border: 0.5px solid rgb(220 220 220 / 50%);
      }
    }
  }
`;
