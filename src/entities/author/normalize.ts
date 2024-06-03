import { AuthorServer } from './server';
import { IAuthor } from './client';
import { normalizeObject } from '@/utils/normalizeObject';

// export const normalizeAuthor = (data: AuthorServer): IAuthor => {
//   return {
//     ...data,
//     birthDate: data.birth_date,
//     deathDate: data.death_date,
//     contacts: data.contacts,
//   };
// };

export const normalizeAuthor = (data: AuthorServer): IAuthor => {
  return normalizeObject(data, {});
};
