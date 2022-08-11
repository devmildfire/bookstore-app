import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledDigital } from './styles';

const Digital: React.FC<ClassNameProps> = (props) => {
  return <StyledDigital {...props} />;
};

export default React.memo(Digital);
