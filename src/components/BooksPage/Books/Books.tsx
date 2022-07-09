import React, { FC } from 'react';
import BooksList from './BooksList';
import Text from '@/components/Common/Text';
import { StyledWrapper } from './styles';
import Container from '@/components/Common/Container';

const Books: FC = () => (
  <StyledWrapper>
    <Container>
      <Text variant='h2' align='center'>
        Издания
      </Text>
    </Container>
    <BooksList />
  </StyledWrapper>
);

export default Books;
