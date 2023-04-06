import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledWrapper } from './styles';
import { PropsWithChildren } from 'react';

const PopupContent: React.FC<PropsWithChildren<ClassNameProps>> = (props) => {
  const { className, children } = props;
  return <StyledWrapper className={className}>{children}</StyledWrapper>;
};

export default PopupContent;
