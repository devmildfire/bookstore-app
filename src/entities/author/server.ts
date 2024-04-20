import { Tables } from 'api/books/types';

export type AuthorServer = Tables<'Authors'>;

export type AuthorPreview = Pick<AuthorServer, 'bio' | 'id' | 'name' | 'photo'>;
