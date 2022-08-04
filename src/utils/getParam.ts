import { ParsedURLQuery } from '@/types/common';

const getParam = (query: ParsedURLQuery, paramName: string): string | null => {
  return (query[paramName] as string) || null;
};

export default getParam;
