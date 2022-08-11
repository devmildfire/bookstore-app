import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import BookIcon from '@/assets/icons/book.svg';
import { StyledIcon } from './styles';

const Book: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <BookIcon />
    </StyledIcon>
  );
};

export default React.memo(Book);
