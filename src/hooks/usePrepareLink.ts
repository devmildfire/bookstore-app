import { useRouter } from 'next/router';

interface UsePrepareLinkParams {
  readonly to?: string;
  readonly isChildPath?: boolean;
  readonly query?: Record<string, string | string[]>;
  readonly keepOldQuery?: boolean;
}

const setQueryParams = (
  newQuery: URLSearchParams,
  query: Record<string, string | string[] | undefined>,
): void => {
  Object.entries(query).forEach(([key, value]) => {
    const currentValue: string | null = newQuery.get(key);
    const newValue: string[] = currentValue ? currentValue.split(',') : [];

    if (Array.isArray(value)) {
      newValue.push(...value);
    } else if (value) {
      newValue.push(value);
    }

    newQuery.set(key, newValue.toString());
  });
};

const usePrepareLink = (params: UsePrepareLinkParams = {}): string => {
  const {
    isChildPath = false,
    query = {},
    keepOldQuery = false,
    to,
  } = params;
  const router = useRouter();

  let newPathname: string = router.pathname;
  const newQuery: URLSearchParams = new URLSearchParams();
  if (to) {
    newPathname = isChildPath ? [router.pathname, to].join('/') : to;
  }

  if (keepOldQuery) {
    setQueryParams(newQuery, router.query);
  }

  setQueryParams(newQuery, query);

  const stringNewQuery: string = newQuery.toString();

  return `${newPathname}?${stringNewQuery}`;
};

export default usePrepareLink;
