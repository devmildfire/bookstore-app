import React, { PropsWithChildren } from 'react';
import booksData from '@/mocks/books';
import ProductSlider from '../ProductSlider';
import Navigation from './Navigation';
import { StyledWrapper } from './styles';

const HomePage = (props: PropsWithChildren<{}>): React.ReactElement => {
  const { children } = props;
  return (
    <StyledWrapper>
      <ProductSlider books={booksData} />
      <Navigation />
      {children}
    </StyledWrapper>
  );
};

export default HomePage;
