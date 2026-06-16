import { cache } from 'react'
import { createDataClient } from '@/lib/supabase/server'
import { getBook, getBookEditions } from '@/api/books/getBook'
import { getEditionPhotos } from '@/api/books/getBookPhotos'
import type { EditionPhotos } from '@/api/books/getBookPhotos'
import type { Book } from '@/entities/book/client'

export type PeriodicalStory = { slug: string; title: string; authorName: string | null }

export type PeriodicalIssue = {
  volumeNumber: number | null
  volumeYear: string | null
  book: Book
  editions: Book[]
  editionPhotos: EditionPhotos
  stories: PeriodicalStory[]
}

export type Periodical = {
  id: number
  slug: string
  name: string
  description: string | null
  thesis: string | null
  issues: PeriodicalIssue[]
}

type IssueRow = { id: number; slug: string | null; volume_number: number | null; volume_year: string | null }
type StoryRow = { slug: string; title: string; Authors: { name: string } | null }

// A periodical (e.g. «Могучий Русский Динозавр») and its issues, newest volume
// first. Each issue is a Title, so we reuse the book RPC for its editions/authors
// and fetch its linked stories (Articles).
// cache(): the book page calls getPeriodical in BOTH generateMetadata and the page
// body — memoize per request so the periodical lookup (+ its per-issue fetches) runs once.
export const getPeriodical = cache(async (slug: string): Promise<Periodical | null> => {
  const supabase = createDataClient()

  const { data: p } = await supabase
    .from('Periodicals')
    .select('id, slug, name, description, thesis')
    .eq('slug', slug)
    .maybeSingle()
  if (!p) return null

  const { data: issueRows } = await supabase
    .from('Titles')
    .select('id, slug, volume_number, volume_year')
    .eq('periodical_id', p.id)
    .order('volume_number', { ascending: false })

  const issues: PeriodicalIssue[] = []
  for (const row of (issueRows ?? []) as IssueRow[]) {
    if (!row.slug) continue
    const [book, editions, editionPhotos, stories] = await Promise.all([
      getBook(row.slug),
      getBookEditions(row.slug),
      getEditionPhotos(row.slug),
      getIssueStories(supabase, row.id),
    ])
    if (!book) continue
    issues.push({
      volumeNumber: row.volume_number,
      volumeYear: row.volume_year,
      book,
      editions,
      editionPhotos,
      stories,
    })
  }

  return { id: p.id, slug: p.slug ?? slug, name: p.name, description: p.description, thesis: p.thesis, issues }
})

async function getIssueStories(
  supabase: ReturnType<typeof createDataClient>,
  titleId: number,
): Promise<PeriodicalStory[]> {
  const { data } = await supabase
    .from('Articles')
    .select('slug, title, Authors:Authors!Articles_author_id_fkey ( name )')
    .eq('title_id', titleId)
    .order('published_at', { ascending: true })
    .order('id', { ascending: true })
  return ((data ?? []) as unknown as StoryRow[]).map((a) => ({
    slug: a.slug,
    title: a.title,
    authorName: a.Authors?.name ?? null,
  }))
}

// If `slug` is a periodical issue, where to redirect (the periodical page anchor).
export const getPeriodicalIssueRedirect = cache(async (
  slug: string,
): Promise<{ periodicalSlug: string; volumeNumber: number | null } | null> => {
  const supabase = createDataClient()
  const { data: title } = await supabase
    .from('Titles')
    .select('periodical_id, volume_number')
    .eq('slug', slug)
    .not('periodical_id', 'is', null)
    .maybeSingle()
  if (!title?.periodical_id) return null

  const { data: p } = await supabase
    .from('Periodicals')
    .select('slug')
    .eq('id', title.periodical_id)
    .maybeSingle()
  if (!p?.slug) return null

  return { periodicalSlug: p.slug, volumeNumber: title.volume_number }
})
