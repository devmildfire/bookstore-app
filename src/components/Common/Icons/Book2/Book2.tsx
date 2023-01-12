import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Book2Icon from '@/assets/icons/book2.svg';
import { StyledIcon } from './styles';

const Book2: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <Book2Icon />
    </StyledIcon>
  );
};

export default React.memo(Book2);
