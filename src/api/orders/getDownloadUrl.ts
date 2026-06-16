import { createAdminClient, createClient } from '@/lib/supabase/server'

export type DownloadUrlResult =
  | { status: 'ok'; url: string; expiresIn: number }
  | { status: 'error'; reason: 'not_authenticated' | 'not_owner' | 'not_digital' | 'no_file' | 'sign_failed'; message?: string }

// Edition kinds that have a downloadable digital file (PrintBook is physical).
const DIGITAL_KINDS = new Set<string>(['EBook', 'AudioBook', 'Book2.0'])

// When the owned edition is physical (PrintBook), we gift the title's digital
// edition. Prefer the most universally readable kind first.
const GIFT_DIGITAL_PREFERENCE = ['EBook', 'Book2.0', 'AudioBook'] as const

// Per-category placeholder objects in the `digital-files` bucket.
// Used when the edition's file_path is null (the real file hasn't been
// uploaded yet) so downloads always produce something — at minimum a
// minimal valid PDF / silent MP3 stub the user can open.
const PLACEHOLDER_FILE: Record<string, string> = {
  EBook: 'placeholders/ebook.pdf',
  AudioBook: 'placeholders/audiobook.mp3',
  'Book2.0': 'placeholders/book2.pdf',
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
    .select('id, book_id, category, order_id, Orders!inner(user_id, status)')
    .eq('id', orderItemId)
    .single()

  if (itemError || !item) {
    return { status: 'error', reason: 'not_owner' }
  }

  const order = Array.isArray(item.Orders) ? item.Orders[0] : item.Orders
  if (order?.user_id !== user.id) {
    return { status: 'error', reason: 'not_owner' }
  }
  // Never hand out files for an unpaid (pending/failed/cancelled) order.
  if (order?.status !== 'paid') {
    return { status: 'error', reason: 'not_owner' }
  }

  // book_id format: '<Category>-<edition_id>'
  const editionId = Number(item.book_id.split('-').slice(1).join('-'))
  if (!Number.isFinite(editionId)) {
    return { status: 'error', reason: 'no_file' }
  }

  // Resolve the purchased edition (kind + file + its title).
  const { data: ownEdition } = await supabase
    .from('Editions')
    .select('kind, file_path, title_id')
    .eq('id', editionId)
    .single()

  if (!ownEdition?.title_id) {
    return { status: 'error', reason: 'no_file' }
  }

  // Decide which digital file to serve:
  //   - bought a digital edition → serve exactly that edition's file;
  //   - bought a physical edition (PrintBook) → gift the title's digital
  //     edition (we always include the digital with a print purchase),
  //     preferring EBook → Book2.0 → AudioBook.
  let kind = ownEdition.kind ?? ''
  let filePath = ownEdition.file_path

  if (!DIGITAL_KINDS.has(kind)) {
    const { data: digitalEditions } = await supabase
      .from('Editions')
      .select('kind, file_path')
      .eq('title_id', ownEdition.title_id)
      .in('kind', [...GIFT_DIGITAL_PREFERENCE])
      .eq('is_published', true)

    const gifted = GIFT_DIGITAL_PREFERENCE.map((k) =>
      (digitalEditions ?? []).find((e) => e.kind === k)
    ).find(Boolean)

    // No digital edition exists for this title — nothing to gift.
    if (!gifted) {
      return { status: 'error', reason: 'no_file' }
    }
    kind = gifted.kind ?? ''
    filePath = gifted.file_path
  }

  // Fall back to the per-category placeholder when the row has no
  // file_path yet (real files get uploaded one by one as titles are
  // published). The placeholder is still a real object in the bucket,
  // so the signed URL works exactly the same way.
  const resolvedPath = filePath || PLACEHOLDER_FILE[kind]
  if (!resolvedPath) {
    return { status: 'error', reason: 'no_file' }
  }

  // Sign with the service-role client. storage.objects has no SELECT
  // policy for authenticated users on the `digital-files` bucket
  // (it's private — public read would defeat the point), and
  // createSignedUrl requires SELECT to find the object. Ownership has
  // already been verified above, so signing under elevated privileges
  // is safe at this point.
  const admin = createAdminClient()
  // `download: true` makes Supabase return Content-Disposition:
  // attachment on the signed URL, so browsers save the file instead of
  // opening it inline (default Content-Disposition: inline tries to
  // open PDFs in the tab and pipes MP3s into the built-in audio
  // player, which isn't a download).
  const { data: signed, error: signError } = await admin.storage
    .from('digital-files')
    .createSignedUrl(resolvedPath, SIGNED_URL_TTL_SECONDS, { download: true })

  if (signError || !signed) {
    return { status: 'error', reason: 'sign_failed', message: signError?.message }
  }

  return { status: 'ok', url: signed.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS }
}
