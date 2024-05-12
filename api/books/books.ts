// import { supabase } from 'api/supabase-client';
// import { Title } from '@/models/books';
// import { PostgrestError } from '@supabase/supabase-js';
import {
  fullManyTitlesQuery,
  fullManyTitlesQueryBySlugFunction,
} from '@/entities/title/server';

export const booksAPI = {
  getTitles: () => {
    return fullManyTitlesQuery;
  },

  getTitleBySlug: (slug: string) => {
    return fullManyTitlesQueryBySlugFunction(slug);
  },
};
