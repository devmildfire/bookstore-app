import { TitleServer } from './server';
import { ITitle } from './client';

function isEmpty(obj: object) {
  return Object.keys(obj).length === 0;
}

export const capFirst = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const keyValuePairFuncs = (
  obj: object | string | number | null,
  outObj: any
) => {
  if (obj === null) {
    return null;
  }

  if (typeof obj === 'string') {
    return obj;
  }

  if (typeof obj === 'number') {
    return obj;
  }

  for (const [key, val] of Object.entries(obj)) {
    const newKey = `${key}`
      .split('_')
      .map((item, index) => (index === 0 ? item : capFirst(item)))
      .join('');

    if (val === null) {
      outObj[newKey] = null;
    }

    if (typeof val !== 'object') {
      outObj[newKey] = val;
    }

    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        outObj[newKey] = val.map((item) => {
          const arrOutObj = {} as any;
          return keyValuePairFuncs(item, arrOutObj);
        });
      } else {
        outObj[newKey] = {} as any;
        keyValuePairFuncs(val, outObj[newKey]); // recursively call the function
      }
    }
  }

  return isEmpty(outObj) ? null : outObj;
};

export const normalizeTitle = (data: object) => {
  return keyValuePairFuncs(data, {});
};
