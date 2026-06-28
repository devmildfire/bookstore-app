import { createDataClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'
import type { BoxSetBook } from '@/entities/boxSet/client'

// Server-side fetch of the books contained in a set of box sets, returned as a
// map keyed by box_set_id. Replaces the per-expand client fetch (useBoxSetBooks)
// — the box sets are already rendered server-side, so their contents are fetched
// in the same pass and passed down as props (no client round-trip, no spinner).
type Row = {
  box_set_id: number
  position: number
  title_id: number
  Titles: {
    id: number
    name: string
    slug: string
    cover: string | null
    Titles_Authors: Array<{ Authors: { name: string } | null }>
  } | null
}

export async function getBoxSetBooksMap(
  boxSetIds: number[]
): Promise<Record<number, BoxSetBook[]>> {
  if (boxSetIds.length === 0) return {}

  const supabase = createDataClient()
  const { data, error } = await supabase
    .from('BoxSetBooks')
    .select(`
      box_set_id,
      position,
      title_id,
      Titles (
        id,
        name,
        slug,
        cover,
        Titles_Authors (
          Authors ( name )
        )
      )
    `)
    .in('box_set_id', boxSetIds)
    .order('position')

  if (error) throw new Error(`Не удалось загрузить книги бокс-сетов: ${error.message}`)

  const map: Record<number, BoxSetBook[]> = {}
  for (const row of (data ?? []) as unknown as Row[]) {
    if (!row.Titles) continue
    const title = row.Titles
    const authorNames = title.Titles_Authors
      .map((ta) => ta.Authors?.name)
      .filter((n): n is string => Boolean(n))
      .sort((a, b) => a.localeCompare(b, 'ru'))
    ;(map[row.box_set_id] ??= []).push({
      titleId: title.id,
      slug: title.slug,
      name: title.name,
      coverUrl: getCoverUrl(title.cover),
      authorName: authorNames.length > 0 ? authorNames.join(', ') : 'Автор не указан',
      position: row.position,
    })
  }
  return map
}
