import { Database } from 'api/books/types';

export type ContactTypeType = Database['public']['Enums']['contacttypes'];

export interface IAuthorContact {
  id: number;
  type: ContactTypeType;
  authorID: number | null;
  contact: string | null;
}

export interface IAuthor {
  bio: string | null;
  birthDate: string | null;
  city: string | null;
  deathDate: string | null;
  id: number;
  name: string;
  photo: string | null;
  phrase: string | null;
  nonsalable: boolean;

  contacts: IAuthorContact[];
}
