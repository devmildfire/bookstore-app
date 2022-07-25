import * as React from 'react';
import Text from '@/components/Common/Text';
import BooksList from './BooksList';
import { StyledWrapper } from './styles';

const Books: React.FC = () => (
  <StyledWrapper>
    <Text>Место для фильтров</Text>
    <BooksList />
  </StyledWrapper>
);

export default React.memo(Books);
