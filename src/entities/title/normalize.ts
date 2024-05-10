import { TitleServer } from './server';
import { ITitle } from './client';

// export const normalizeAuthor = (data: TitleServer): ITitle => {
//   return {
//     ...data,
//     birthDate: data.birth_date,
//     deathDate: data.death_date,
//   };
// };

export const capFirst = (input: string): string => {
  return input.charAt(0).toUpperCase() + input.slice(1);
};

export const keyValuePairFuncs = (obj: object | null, outObj: any) => {
  if (!obj) return; // Added a null check for  Uncaught TypeError: Cannot convert undefined or null to object

  // const outObj = {} as any;

  for (const [key, val] of Object.entries(obj)) {
    console.log(`${key}: ${JSON.stringify(val)}`);

    const newKey = `${key}`
      .split('_')
      .map((item, index) => (index === 0 ? item : capFirst(item)))
      .join('');

    if (typeof val !== 'object') outObj[newKey] = val;

    if (typeof val === 'object') {
      if (Array.isArray(val)) {
        console.log('found an array !!!');

        outObj[newKey] = val.map((item) => {
          const arrOutObj = {} as any;
          return keyValuePairFuncs(item, arrOutObj);
        });
      }

      outObj[newKey] = {} as any;
      keyValuePairFuncs(val, outObj[newKey]); // recursively call the function
    }
  }

  return outObj;
};

export const normalizeTitle = (data: object) => {
  return keyValuePairFuncs(data, {});
};
