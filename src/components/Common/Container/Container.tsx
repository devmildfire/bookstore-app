import React, { PropsWithChildren } from 'react';
import { ClassNameProps } from '@/types/className';
import StyledContainer from './styles';

const Container = (
  props: PropsWithChildren<ClassNameProps>,
): React.ReactElement => {
  const { children, className } = props;
  return <StyledContainer className={className}>{children}</StyledContainer>;
};

export default Container;
