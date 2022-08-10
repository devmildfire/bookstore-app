/* eslint-disable no-nested-ternary */
import { AddType, ID, ParsedURLQuery } from '@/types/common';

const setQueryParams = (
  newQuery: URLSearchParams,
  query: ParsedURLQuery,
  deletedQuery: AddType<ParsedURLQuery, boolean> = {}
): void => {
  Object.entries(query).forEach(([key, value]) => {
    const newValue: ID[] = [];
    const deletedValue = deletedQuery[key];

    let additionValue: string[] = value
      ? Array.isArray(value)
        ? value
        : [value]
      : [];

    switch (typeof deletedValue) {
      case 'string': {
        additionValue = additionValue.filter(
          (addValue) => addValue !== deletedValue
        );
        break;
      }
      case 'object': {
        additionValue = additionValue.filter(
          (addValue) => !deletedValue.includes(addValue)
        );
        break;
      }
      case 'boolean': {
        additionValue = [];
        break;
      }
      default: {
        break;
      }
    }

    if (additionValue.length) {
      newValue.push(...additionValue);
    }

    newQuery.set(key, newValue.toString());
  });
};

export default setQueryParams;
