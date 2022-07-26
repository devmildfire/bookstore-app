import * as React from 'react';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { ClassNameProps } from '@/types/className';
import { StyledIntersectingElement, StyledProductsList } from './styles';
import useInfinityQuery, {
  UseInfinityQueryOptions,
} from '@/hooks/useInfinityQuery';
import { Pagination } from '@/types/api';
import separateOnRow from '@/utils/separateOnRow';

interface ItemRenderProps<T> {
  readonly rows: T[][];
}

type ItemRender<T> = (props: ItemRenderProps<T>) => React.ReactNode;

interface InfinityListProps<T>
  extends ClassNameProps,
    UseInfinityQueryOptions<
      UseQuery<QueryDefinition<Pagination, any, any, any>>
    > {
  readonly inRow: number;
  readonly children: ItemRender<T>;
  readonly rootMargin?: string;
}

const InfinityList = <T, >(props: InfinityListProps<T>): React.ReactElement => {
  const {
    children, useQuery, className, startPage, inRow, rootMargin,
  } = props;
  const { data = [], fetchNextPage } = useInfinityQuery({
    useQuery,
    startPage,
  });
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rows: T[][] = React.useMemo(
    () => separateOnRow(data, inRow),
    [data, inRow],
  );

  React.useEffect(() => {
    if (ref.current) {
      const observer = new IntersectionObserver(
        ([entity]) => {
          if (entity.isIntersecting) {
            fetchNextPage();
          }
        },
        {
          rootMargin,
        },
      );
      observer.observe(ref.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [ref.current, rootMargin]);
  return (
    <StyledProductsList className={className}>
      {children({ rows })}
      <StyledIntersectingElement position='bottom' ref={ref} />
    </StyledProductsList>
  );
};

export default React.memo(InfinityList);
