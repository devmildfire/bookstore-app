import { QueryData } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';

export const fullTitleQuery = supabase
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
  .limit(1)
  .single();

type FullTitleQueryType = QueryData<typeof fullTitleQuery>;

export type TitleServer = FullTitleQueryType;
export type TitlesServer = TitleServer[];
