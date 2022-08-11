import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledBook } from './styles';

const Book: React.FC<ClassNameProps> = (props) => {
  return <StyledBook {...props} />;
};

export default React.memo(Book);
