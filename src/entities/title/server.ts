import { QueryData } from '@supabase/supabase-js';
import { supabase } from 'api/supabase-client';

export const fullTitleQuery = supabase
  .from('Titles')
  .select(
    `
        *,
        authors: Titles_Authors ( ...Authors(*, 
          contacts: AuthorsContacts ( * )
        )),
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
        awards: TitlesAwards ( *,  ...Awards(*) ),
        novels: Novels_List ( * )

  `
  )
  .limit(1)
  .single();

export const fullManyTitlesQuery = supabase
  .from('Titles')
  .select(
    `
        *,
        authors: Titles_Authors ( ...Authors(*, 
          contacts: AuthorsContacts ( * )
        )),
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
        awards: TitlesAwards ( *,  ...Awards(*) ),
        novels: Novels_List ( * )

  `
  )
  .returns<FullTitleQueryType[]>();

export const fullManyTitlesQueryBySlugFunction = (slug: string) => {
  const fullManyTitlesQueryBySlug = supabase
    .from('Titles')
    .select(
      `
          *,
          authors: Titles_Authors ( ...Authors(*, 
            contacts: AuthorsContacts ( * )
          )),
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
          awards: TitlesAwards ( *,  ...Awards(*) ),
          novels: Novels_List ( * )
  
    `
    )
    .eq('slug', slug)
    .returns<FullTitleQueryType[]>();

  return fullManyTitlesQueryBySlug;
};

type FullTitleQueryType = QueryData<typeof fullTitleQuery>;

export type TitleServer = FullTitleQueryType;

export type TitlePreview = Pick<TitleServer, 'id' | 'name' | 'cover'>;
