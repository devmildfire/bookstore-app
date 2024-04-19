import { AuthorServer } from './server';
import { IAuthor } from './client';

export const normalizeAuthor = (data: AuthorServer): IAuthor => {
  return {
    ...data,
    birthDate: data.birth_date,
    deathDate: data.death_date,
  };
};
