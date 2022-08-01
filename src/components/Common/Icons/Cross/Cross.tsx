import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledCross } from './styles';

type ArrowProps = ClassNameProps

const Arrow: React.FC<ArrowProps> = (props) => {
  const { className } = props;
  return <StyledCross className={className} />;
};

export default React.memo(Arrow);
