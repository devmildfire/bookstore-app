import React, { FC } from 'react';
import BooksList from './BooksList';
import Text from '@/components/Common/Text';
import { StyledWrapper } from './styles';

const Books: FC = () => (
  <StyledWrapper>
    <Text variant='h2' align='center'>
      Издания
    </Text>
    <BooksList />
  </StyledWrapper>
);

export default Books;
