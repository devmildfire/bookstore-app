import React from 'react';
import styled from 'styled-components';
import booksData from '@/mocks/books';
import Text from '@/components/Common/Text';
import Container from '@/components/Common/Container';
import Button from '@/components/Common/Button';
import BooksList from '@/components/BooksList';

const NewProduct = (): React.ReactElement => (
  <StyleWrapper>
    <StyledHeader variant='h2' align='center'>
      КНИЖНАЯ ЛАВКА
    </StyledHeader>
    <BooksList books={booksData} />
    <StyledButton href='/' variant='wide' rounded styleVariant='outlined'>
      На главную
    </StyledButton>
  </StyleWrapper>
);

export default NewProduct;

const StyleWrapper = styled(Container)`
  display: grid;
  gap: 100px;
  justify-items: center;
`;

const StyledHeader = styled(Text)`
  margin: 50px 0 80px;
`;

const StyledButton = styled(Button)`
  margin-bottom: 200px;
`;
