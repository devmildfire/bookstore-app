import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledIcon } from './styles';
import ArrowIcon from '@/assets/icons/arrow.svg';

const Arrow: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <ArrowIcon />
    </StyledIcon>
  );
};

export default React.memo(Arrow);
