import React from 'react';
import BooksSlider from '../PageLayout/BooksSlider';
import NewProduct from '../NewProduct';
import booksData from '@/mocks/books';

const MainPage = (): React.ReactElement => (
  <main>
    <BooksSlider books={booksData} />
    <NewProduct />
  </main>
);

export default MainPage;
