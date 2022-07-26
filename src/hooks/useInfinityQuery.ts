import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { Pagination } from '@/types/api';
import { VoidFunction } from '@/types/common';

export interface UseInfinityQueryOptions<
  QueryHook extends UseQuery<QueryDefinition<Pagination, any, any, any>>
> {
  readonly useQuery: QueryHook;
  readonly startPage?: number;
}

export interface UseInfinityQueryResult<R> {
  readonly data?: R;
  readonly fetchNextPage: VoidFunction;
}

const useInfinityQuery = <
  R extends Array<unknown>,
  QueryHook extends UseQuery<QueryDefinition<Pagination, any, any, R>>
>(
    options: UseInfinityQueryOptions<QueryHook>,
  ): UseInfinityQueryResult<R> => {
  const { useQuery, startPage = 1 } = options;
  const [page, setPage] = useState<number>(startPage);
  const shouldAddData = useRef<boolean>(false);
  const result = useQuery({ page });
  const [data, setData] = useState<R | undefined>(result.data);

  useEffect(() => {
    if (!result.isSuccess || !shouldAddData.current) {
      return;
    }
    shouldAddData.current = false;
    setData((currentResult) => [...(currentResult || []), ...result.data] as R);
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
