import React from 'react';
import Slider from '../PageLayout/Slider';
import NewProduct from '../NewProduct';
import booksData from '../../utils/booksData';

const MainPage = (): React.ReactElement => (
  <>
    <Slider books={booksData} />
    <NewProduct />
  </>
);

export default MainPage;
