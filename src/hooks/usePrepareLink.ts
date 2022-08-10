import { useRouter } from 'next/router';
import { AddType, ParsedURLQuery } from '@/types/common';
import setQueryParams from '@/utils/setQueryParams';

interface UsePrepareLinkParams {
  readonly to?: string;
  readonly isChildPath?: boolean;
  readonly query?: ParsedURLQuery;
  readonly keepOldQuery?: boolean;
  readonly deleteQuery?: AddType<ParsedURLQuery, boolean>;
}

const usePrepareLink = (params: UsePrepareLinkParams = {}): string => {
  const {
    to,
    isChildPath = false,
    query = {},
    keepOldQuery = false,
    deleteQuery,
  } = params;
  const router = useRouter();

  let newPathname: string = router.pathname;
  const newQuery: URLSearchParams = new URLSearchParams();
  if (to) {
    newPathname = isChildPath ? [router.pathname, to].join('/') : to;
  }

  if (keepOldQuery || deleteQuery) {
    setQueryParams(newQuery, router.query, deleteQuery);
  }

  setQueryParams(newQuery, query);

  const stringNewQuery: string = newQuery.toString();

  return `${newPathname}?${stringNewQuery}`;
};

export default usePrepareLink;
