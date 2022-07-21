import * as React from 'react';
import { ClassNameProps } from '@/types/className';
import {
  ListContext,
  ListContextOptions,
  ListContextProvider,
} from './contexts/ListContext';
import { StyledList, StyledListProps } from './styles';

type Tag = 'div' | 'ul' | 'ol';

interface ListProps extends Partial<StyledListProps>, ClassNameProps {
  readonly tag?: Tag;
}

const List: React.FC<ListProps> = (props) => {
  const {
    children, tag, gap, className,
  } = props;
  const { columnGap, rowGap } = React.useContext(ListContext);
  const listGap = gap ?? [rowGap, columnGap];
  const contextGap: ListContextOptions = Array.isArray(listGap)
    ? { columnGap: listGap[1], rowGap: listGap[0] }
    : { columnGap: listGap, rowGap: listGap };
  return (
    <StyledList className={className} as={tag} gap={listGap}>
      <ListContextProvider {...contextGap}>{children}</ListContextProvider>
    </StyledList>
  );
};

export default React.memo<React.PropsWithChildren<ListProps>>(List);
