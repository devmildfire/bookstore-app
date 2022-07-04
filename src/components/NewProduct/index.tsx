import React from 'react';
import styled from 'styled-components';

import booksData from '@/mocks/books';
import Text from '../Common/Text';
import BooksList from '../Books/BooksList';
import Container from '../Common/Container';
import Button from '../Common/Button';

const NewProduct = (): React.ReactElement => (
  <StyleWrapper>
    <Text className='newProductTitle' variant='h2' align='center'>
      НОВИНКИ
    </Text>
    <BooksList books={booksData} />
    <StyledButton href='/books' variant='wide' styleVariant='outlined' rounded>
      Перейти в книжную лавку
    </StyledButton>
  </StyleWrapper>
);

export default NewProduct;

const StyleWrapper = styled(Container)`
  display: grid;
  gap: 100px;

  .newProductTitle {
    margin-top: 100px;
  }
`;

const StyledButton = styled(Button)`
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 200px;
`;
