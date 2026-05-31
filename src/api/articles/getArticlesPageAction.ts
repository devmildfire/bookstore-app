'use server'

import { getArticlesPage, type ArticleCursor, type ArticlePage } from './getArticlesPage'

// Thin server action wrapper around getArticlesPage so the infinite
// scroll on /dino-magazine can fetch subsequent batches from a Client
// Component without exposing the Supabase service-role surface.
export async function getArticlesPageAction(cursor: ArticleCursor): Promise<ArticlePage> {
  return getArticlesPage(cursor)
}
