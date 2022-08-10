import * as React from 'react';
import Author from './Author';
import { StyledFilterWrapper } from './styles';
import Type from './Type';
import Year from './Year';

const Filters: React.FC = () => {
  /* TODO: структурировать и стилизовать фильтры */
  return (
    <StyledFilterWrapper>
      <Year />
      <Type />
      <Author />
    </StyledFilterWrapper>
  );
};

export default React.memo(Filters);
