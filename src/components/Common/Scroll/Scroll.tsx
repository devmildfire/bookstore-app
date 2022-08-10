import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledWrapper } from './styles';

const Scroll: React.FC<ClassNameProps> = (props) => {
  const { children, ...rest } = props;
  return <StyledWrapper {...rest}>{children}</StyledWrapper>;
};

export default Scroll;
