import { useRouter } from 'next/router';
import { ParsedURLQuery } from '@/types/common';
import setQueryParams from '@/utils/setQueryParams';

interface UsePrepareLinkParams {
  readonly to?: string;
  readonly isChildPath?: boolean;
  readonly query?: ParsedURLQuery;
  readonly keepOldQuery?: boolean;
}

const usePrepareLink = (params: UsePrepareLinkParams = {}): string => {
  const { isChildPath = false, query = {}, keepOldQuery = false, to } = params;
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
