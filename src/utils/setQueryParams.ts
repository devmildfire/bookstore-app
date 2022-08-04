import { ID, ParsedURLQuery } from '@/types/common';

const setQueryParams = (
  newQuery: URLSearchParams,
  query: ParsedURLQuery,
): void => {
  Object.entries(query).forEach(([key, value]) => {
    const newValue: ID[] = [];

    if (Array.isArray(value)) {
      newValue.push(...value);
    } else if (value) {
      newValue.push(value);
    }

    newQuery.set(key, newValue.toString());
  });
};

export default setQueryParams;
