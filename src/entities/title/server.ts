import { QueryData } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';

export const fullTitleQuery = supabase
  .from('Titles')
  .select(
    `
        *,
        authors: Titles_Authors ( ...Authors(*)),
        Photos( * ),
        cardBook: CardBooks ( * ),
        audioBook: Audiobooks ( * ),
        eBook: Ebooks ( * ),
        printedBook: PrintedBooks ( *,
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

export const fullManyTitlesQuery = supabase
  .from('Titles')
  .select(
    `
        *,
        authors: Titles_Authors ( ...Authors(*)),
        Photos( * ),
        cardBook: CardBooks ( * ),
        audioBook: Audiobooks ( * ),
        eBook: Ebooks ( * ),
        printedBook: PrintedBooks ( *,
          options:PrintOptions ( *,
            size: PrintSize( * )
          ),
          cover:PrintedCover( * )
        ),
        awards: TitlesAwards ( *,  ...Awards(*) )

  `
  )
  .returns<FullTitleQueryType[]>();

export const fullManyTitlesQueryBySlugFunction = (slug: string) => {
  const fullManyTitlesQueryBySlug = supabase
    .from('Titles')
    .select(
      `
          *,
          authors: Titles_Authors ( ...Authors(*)),
          Photos( * ),
          cardBook: CardBooks ( * ),
          audioBook: Audiobooks ( * ),
          eBook: Ebooks ( * ),
          printedBook: PrintedBooks ( *,
            options:PrintOptions ( *,
              size: PrintSize( * )
            ),
            cover:PrintedCover( * )
          ),
          awards: TitlesAwards ( *,  ...Awards(*) )
  
    `
    )
    .eq('slug', slug)
    .returns<FullTitleQueryType[]>();

  return fullManyTitlesQueryBySlug;
};

type FullTitleQueryType = QueryData<typeof fullTitleQuery>;

export type TitleServer = FullTitleQueryType;
