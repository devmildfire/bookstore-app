import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import AudioIcon from '@/assets/icons/audio.svg';
import { StyledIcon } from './styles';

const Audio: React.FC<ClassNameProps> = (props) => {
  return (
    <StyledIcon {...props}>
      <AudioIcon />
    </StyledIcon>
  );
};

export default React.memo(Audio);
