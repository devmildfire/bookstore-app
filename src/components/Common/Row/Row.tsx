import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import { StyledRow } from './styles';
import { PropsWithChildren } from 'react';

type RowProps = ClassNameProps;
const Row: React.FC<PropsWithChildren<RowProps>> = (props) => {
  const { children, className } = props;
  return <StyledRow className={className}>{children}</StyledRow>;
};

export default Row;
