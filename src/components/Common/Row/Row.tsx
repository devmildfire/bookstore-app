import * as React from 'react';
import { ListContext } from '../List/contexts/ListContext';
import { StyledRow, StyledRowProps } from './styles';

interface RowProps extends Partial<StyledRowProps> {}

const Row: React.FC<RowProps> = (props) => {
  const { children, gap } = props;
  const { columnGap, rowGap } = React.useContext(ListContext);
  const gapRow = gap ?? [rowGap, columnGap];
  return <StyledRow gap={gapRow}>{children}</StyledRow>;
};

export default React.memo<React.PropsWithChildren<RowProps>>(Row);
