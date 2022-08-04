import { useRouter } from 'next/router';
import { useState, useLayoutEffect } from 'react';
import setQueryParams from '@/utils/setQueryParams';
import useEvent from '@/hooks/useEvent';

export type GetValueByQuery<T, R> = (
  values: T[],
  queryValue: string | string[]
) => R;

export type GetValueToQuery<R> = (values: R) => string[];

export interface UseStateSyncQueryOptions<T, R> {
  readonly queryName: string;
  readonly values: T[];
  readonly getValueByQuery: GetValueByQuery<T, R>;
  readonly getValueToQuery: GetValueToQuery<R>;
  readonly shallow?: boolean;
}

const useStateSyncQuery = <T, R = T>(
  options: UseStateSyncQueryOptions<T, R>,
): [R, (values: R) => void] => {
  const {
    queryName,
    values,
    getValueByQuery,
    getValueToQuery,
    shallow = true,
  } = options;
  const { query, isReady, push } = useRouter();
  const { [queryName]: value = '' } = query;
  const startValue = getValueByQuery(values, (value as string).split(','));
  const [state, setState] = useState<R>(startValue);

  useLayoutEffect(() => {
    /* Синхронное установка текущего состояния, если был SSG */
    if (isReady) {
      const currentValue = getValueByQuery(
        values,
        (value as string).split(','),
      );
      setState(currentValue);
    }
  }, [isReady, value, values]);

  // eslint-disable-next-line no-shadow
  const setStateSyncQuery = useEvent((values: R) => {
    const newQuery = new URLSearchParams();
    setQueryParams(newQuery, query);
    setQueryParams(newQuery, {
      [queryName]: getValueToQuery(values),
    });

    push(`?${newQuery.toString()}`, undefined, {
      scroll: false,
      shallow,
    });
  });

  return [state, setStateSyncQuery];
};

export default useStateSyncQuery;
