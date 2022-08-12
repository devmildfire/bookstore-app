import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledWrapper } from './styles';

const PopupContent: React.FC<ClassNameProps> = (props) => {
  const { className, children, } = props;
  return <StyledWrapper className={className}>{children}</StyledWrapper>;
};

export default PopupContent;
