import { useCallback, useEffect, useRef, useState } from 'react';
import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { Pagination } from '@/types/api';
import { VoidFunction } from '@/types/common';

export interface UseInfinityQueryOptions<
  QP extends Pagination,
  QueryHook extends UseQuery<QueryDefinition<QP, any, any, any>>
> {
  readonly useQuery: QueryHook;
  readonly otherParams?: Omit<QP, keyof Pagination>;
  readonly startPage?: number;
}

export interface UseInfinityQueryResult<R> {
  readonly data?: R;
  readonly fetchNextPage: VoidFunction;
  readonly isLoading: boolean;
  readonly isFetching: boolean;
}

const useInfinityQuery = <
  R extends Array<unknown>,
  QP extends Pagination,
  QueryHook extends UseQuery<QueryDefinition<QP, any, any, R>>
>(
    options: UseInfinityQueryOptions<QP, QueryHook>
  ): UseInfinityQueryResult<R> => {
  const { useQuery, otherParams = {}, startPage = 1 } = options;
  const [page, setPage] = useState<number>(startPage);
  const shouldAddData = useRef<boolean>(false);
  const result = useQuery({ page, ...otherParams } as any);
  const [data, setData] = useState<R | undefined>(result.data);

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    if (shouldAddData.current) {
      setData(
        (currentResult) => [...(currentResult || []), ...result.data] as R
      );
    } else {
      setData(result.data);
    }
    shouldAddData.current = false;
  }, [result.data]);

  const fetchNextPage = useCallback(() => {
    shouldAddData.current = true;
    setPage((currentPage) => currentPage + 1);
  }, []);

  const response: UseInfinityQueryResult<R> = {
    ...result,
    fetchNextPage,
  };

  if (data?.length) {
    Object.assign(response, { data });
  }

  return response;
};

export default useInfinityQuery;
