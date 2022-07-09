import React, { FC } from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';

const Container: FC<ClassNameProps> = (props) => {
  const { children, className } = props;
  return <StyledContainer className={className}>{children}</StyledContainer>;
};

export default Container;
