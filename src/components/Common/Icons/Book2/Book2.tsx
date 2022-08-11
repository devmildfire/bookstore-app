import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledBook2 } from './styles';

const Book2: React.FC<ClassNameProps> = (props) => {
  return <StyledBook2 {...props} />;
};

export default React.memo(Book2);
