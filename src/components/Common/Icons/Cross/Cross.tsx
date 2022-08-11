import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import Cross from '@/assets/icons/cross.svg';
import { StyledIcon } from './styles';

const Arrow: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <Cross />
    </StyledIcon>
  );
};

export default React.memo(Arrow);
