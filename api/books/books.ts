import { supabase } from 'api/supabase-client';
import { Title } from '@/models/books';
import { PostgrestError } from '@supabase/supabase-js';

export const API = {
  getTitles: () => {
    return supabase
      .from('Titles')
      .select(
        `
      *,
      authors: Titles_Authors ( ...Authors(*)),
      Photos( * ),
      CardBooks ( * ),
      Audiobooks ( * ),
      Ebooks ( * ),
      PrintedBooks ( *,
        options:PrintOptions ( *,
          size:PrintSize( * )
        ),
        cover:PrintedCover( * )
      ),
      awards: TitlesAwards ( *,  ...Awards(*) )
      `
      )
      .returns<Title[]>();
  },

  getTitlebySlug: (slug: string) => {
    return supabase
      .from('Titles')
      .select(
        `
      *,
      authors: Titles_Authors ( ...Authors(*)),
      Photos( * ),
      CardBooks ( * ),
      Audiobooks ( * ),
      Ebooks ( * ),
      PrintedBooks ( *,
        options:PrintOptions ( *,
          size:PrintSize( * )
        ),
        cover:PrintedCover( * )
      ),
      awards: TitlesAwards ( *,  ...Awards(*) )
      `
      )
      .eq('slug', slug)
      .returns<Title>();
  },
};
