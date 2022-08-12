import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledIcon } from './styles';
import DigitalIcon from '@/assets/icons/digital.svg';

const Digital: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <DigitalIcon />
    </StyledIcon>
  );
};

export default React.memo(Digital);
