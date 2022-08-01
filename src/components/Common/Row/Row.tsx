import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledRow } from './styles';

type RowProps = ClassNameProps
const Row: React.FC<RowProps> = (props) => {
  const { children, className } = props;
  return <StyledRow className={className}>{children}</StyledRow>;
};

export default Row;
