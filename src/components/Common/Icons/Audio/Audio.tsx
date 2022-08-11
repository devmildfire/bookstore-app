import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledAudio } from './styles';

const Audio: React.FC<ClassNameProps> = (props) => {
  return <StyledAudio {...props} />;
};

export default React.memo(Audio);
