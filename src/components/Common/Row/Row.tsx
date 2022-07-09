import * as React from 'react';
import { StyledWrapper } from './styles';

interface RowProps {}

const Row: React.FC<RowProps> = (props) => {
  const { children } = props;
  return <StyledWrapper>{children}</StyledWrapper>;
};

export default React.memo(Row);
