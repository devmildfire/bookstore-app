import { ParsedURLQuery } from '@/types/common';

const getParam = <T extends string>(
  query: ParsedURLQuery,
  paramName: string
): T | null => {
  return query[paramName] as T | undefined || null;
};

export default getParam;
