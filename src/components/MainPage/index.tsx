import React from 'react';

import styled from 'styled-components';

import BookCard from '../BookCard';
import booksData from '../../utils/booksData';

const MainPage = (): React.ReactElement => (
  <StyleWrapper>
    {booksData.map((book) => (
      <BookCard book={book} />
    ))}
  </StyleWrapper>
);

export default MainPage;

const StyleWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(200px,1fr));
  grid-column-gap: 219px;
  grid-row-gap: 80px;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 1rem;
`;
