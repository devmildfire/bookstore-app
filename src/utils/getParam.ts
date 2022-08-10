import { ParsedURLQuery } from '@/types/common';

const getParam = <T extends string>(
  query: ParsedURLQuery,
  paramName: string
): T[] | null => {
  return ((query[paramName] as string)?.split(',') as T[]) || null;
};

export default getParam;
