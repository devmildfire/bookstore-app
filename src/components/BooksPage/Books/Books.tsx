import React, { FC } from 'react';
import Text from '@/components/Common/Text';
import BooksList from './BooksList';
import { StyledWrapper } from './styles';

const Books: FC = () => (
  <StyledWrapper>
    <Text>Место для фильтров</Text>
    <BooksList />
  </StyledWrapper>
);

export default Books;
