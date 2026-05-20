import { createClient } from '@/lib/supabase/server'
import type { ProductCategory } from '@/types/database'

export type DownloadUrlResult =
  | { status: 'ok'; url: string; expiresIn: number }
  | { status: 'error'; reason: 'not_authenticated' | 'not_owner' | 'not_digital' | 'no_file' | 'sign_failed'; message?: string }

const DIGITAL_FILE_TABLE: Record<string, 'Ebooks' | 'Audiobooks' | 'CardBooks'> = {
  EBook: 'Ebooks',
  AudioBook: 'Audiobooks',
  'Book2.0': 'CardBooks',
}

const SIGNED_URL_TTL_SECONDS = 3600 // 1 hour

// Given an OrderItem id, verifies ownership and issues a fresh 1 h signed URL
// for the underlying digital file. Re-calling = regeneration.
export async function getDownloadUrl(orderItemId: number): Promise<DownloadUrlResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', reason: 'not_authenticated' }

  // RLS-friendly read: join OrderItems → Orders, scope to user.
  const { data: item, error: itemError } = await supabase
    .from('OrderItems')
    .select('id, book_id, category, order_id, Orders!inner(user_id)')
    .eq('id', orderItemId)
    .single()

  if (itemError || !item) {
    return { status: 'error', reason: 'not_owner' }
  }

  const ownerId = Array.isArray(item.Orders) ? item.Orders[0]?.user_id : item.Orders?.user_id
  if (ownerId !== user.id) {
    return { status: 'error', reason: 'not_owner' }
  }

  const category = (item.category ?? '') as ProductCategory
  const table = DIGITAL_FILE_TABLE[category]
  if (!table) {
    return { status: 'error', reason: 'not_digital' }
  }

  // book_id format: '<Category>-<edition_id>'
  const editionId = Number(item.book_id.split('-').slice(1).join('-'))
  if (!Number.isFinite(editionId)) {
    return { status: 'error', reason: 'no_file' }
  }

  const { data: edition, error: editionError } = await supabase
    .from(table)
    .select('file_path')
    .eq('id', editionId)
    .single()

  if (editionError || !edition?.file_path) {
    return { status: 'error', reason: 'no_file' }
  }

  const { data: signed, error: signError } = await supabase.storage
    .from('digital-files')
    .createSignedUrl(edition.file_path, SIGNED_URL_TTL_SECONDS)

  if (signError || !signed) {
    return { status: 'error', reason: 'sign_failed', message: signError?.message }
  }

  return { status: 'ok', url: signed.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS }
}
