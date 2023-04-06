import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';

const Icon: React.FC<PropsWithChildren<ClassNameProps>> = (props) => {
  const { children, ...rest } = props;
  return <StyledWrapper {...rest}>{children}</StyledWrapper>;
};

export default Icon;
