import {
  AuthorServer,
  IAuthor,
  fullAuthorQueryByIdFunction,
} from '@/entities/author';
import { fullManyTitlesQuery } from '@/entities/title/server';
import { getAllEnums } from '@/utils/getAllEnums';
import { supabase } from 'api/supabase-client';

export const adminAPI = {
  login: async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  getAuthors: async () => {
    const response = await supabase
      .from('Authors')
      .select('id, bio, photo, name');
    return response;
  },
  getAuthorById: async (id: number) => {
    const response = await fullAuthorQueryByIdFunction(id);

    if (!response.data) {
      return response;
    }

    return { ...response, data: response.data[0] };
  },
  updateAuthor: async (author: AuthorServer) => {
    return await supabase
      .from('Authors')
      .update(author)
      .eq('id', author.id)
      .select('*, contacts: AuthorsContacts ( * )')
      .single();
  },
  getTitles: async () => {
    const response = await fullManyTitlesQuery;
    return response;
  },
  getEnums: async () => {
    const response = await getAllEnums();

    return response;
  },
};
