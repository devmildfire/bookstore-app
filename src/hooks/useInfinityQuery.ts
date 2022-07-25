import { useCallback, useEffect, useState } from 'react';
import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { Pagination } from '@/types/api';
import { VoidFunction } from '@/types/common';

type GetResultTypeFromEndpoint<QueryHook> = QueryHook extends UseQuery<
  QueryDefinition<any, any, string, infer ResultType, string>
>
  ? ResultType
  : never;

interface UseInfinityQueryOptions {
  readonly startPage?: number;
}

interface UseInfinityQueryResult<Result> {
  readonly data?: Result;
  readonly fetchNextPage: VoidFunction;
}

const useInfinityQuery = <
  QueryHook extends UseQuery<QueryDefinition<Pagination, any, any, any>>,
  Result extends Array<unknown> = GetResultTypeFromEndpoint<QueryHook>
>(
    useQuery: QueryHook,
    options: UseInfinityQueryOptions = {},
  ): UseInfinityQueryResult<Result> => {
  const { startPage = 1 } = options;
  const [page, setPage] = useState<number>(startPage);
  const result = useQuery({ page });
  const [data, setData] = useState<Result>(result.data);

  useEffect(() => {
    if (!result.isSuccess) {
      return;
    }
    setData((currentData) => [...currentData, ...result.data] as Result);
  }, [result.data]);

  const fetchNextPage = useCallback(() => {
    setPage((currentPage) => currentPage + 1);
  }, []);

  const response: UseInfinityQueryResult<Result> = {
    ...result,
    fetchNextPage,
  };

  if (data.length) {
    Object.assign(response, { data });
  }

  return response;
};

export default useInfinityQuery;
