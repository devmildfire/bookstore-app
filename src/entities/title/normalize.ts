// import { TitleServer } from './server';
// import { fullTitleQuery } from './server';
import { ITitle } from './client';
import { normalizeObject } from '@/utils/normalizeObject';

export const normalizeTitle = (data: object): ITitle => {
  return normalizeObject(data, {});
};

//  так оно скорее всего не сработает
// const normalizedQuery = normalizeTitle(fullTitleQuery);
// export type FullTitleNormalizedType = typeof normalizedQuery;
