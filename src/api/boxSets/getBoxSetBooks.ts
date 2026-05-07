import { createClient } from '@/lib/supabase/client'
import { getCoverUrl } from '@/lib/storage'
import type { BoxSetBook } from '@/entities/boxSet/client'
import type { BoxSetBooksRow } from '@/entities/boxSet/server'

export const boxSetBooksQueryKey = (boxSetId: number) =>
  ['box-set-books', boxSetId] as const

export async function getBoxSetBooks(boxSetId: number): Promise<BoxSetBook[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('BoxSetBooks')
    .select(`
      position,
      title_id,
      Titles (
        id,
        name,
        cover,
        Titles_Authors (
          Authors ( name )
        )
      )
    `)
    .eq('box_set_id', boxSetId)
    .order('position')

  if (error) throw new Error(`Не удалось загрузить книги бокс-сета: ${error.message}`)

  return ((data ?? []) as unknown as BoxSetBooksRow[])
    .filter((row) => row.Titles !== null)
    .map((row) => {
      const title = row.Titles!
      const authorNames = title.Titles_Authors
        .map((ta) => ta.Authors?.name)
        .filter((n): n is string => Boolean(n))
        .sort((a, b) => a.localeCompare(b, 'ru'))
      return {
        titleId: title.id,
        name: title.name,
        coverUrl: getCoverUrl(title.cover),
        authorName: authorNames.length > 0 ? authorNames.join(', ') : 'Автор не указан',
        position: row.position,
      }
    })
}
