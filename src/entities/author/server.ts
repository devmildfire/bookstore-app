import { QueryData } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';

export type AuthorPreview = Pick<AuthorServer, 'bio' | 'id' | 'name' | 'photo'>;

export const fullAuthorQuery = supabase
  .from('Authors')
  .select(
    `
        *, contacts: AuthorsContacts ( * )
    `
  )
  .limit(1)
  .single();

type FullAuthorQueryType = QueryData<typeof fullAuthorQuery>;

export type AuthorServer = FullAuthorQueryType;
export type ContactsServer = AuthorServer['contacts'];

export const fullAuthorQueryByIdFunction = (id: number) => {
  const fullAuthorQueryById = supabase
    .from('Authors')
    .select(
      `
       *, contacts: AuthorsContacts ( * )
   `
    )
    .eq('id', id)
    .returns<AuthorServer[]>();

  return fullAuthorQueryById;
};

export const fullManyAuthorsQuery = supabase
  .from('Authors')
  .select(
    `
      *, contacts: AuthorsContacts ( * )
  `
  )
  .returns<FullAuthorQueryType[]>();
