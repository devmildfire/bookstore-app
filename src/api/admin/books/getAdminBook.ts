import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'
import {
  EDITION_LABEL,
  ALL_EDITION_KINDS,
  EDITION_FILE_FOLDER,
  EDITION_HAS_DEMO,
  EDITION_HAS_SOLD_OUT,
  type EditionKind,
  type BookStatus,
  type AdminEdition,
  type AdminAward,
  type AdminWorker,
} from '@/lib/admin/bookProducts'

export { EDITION_LABEL, ALL_EDITION_KINDS }
export type { EditionKind, BookStatus, AdminEdition, AdminAward }

// The full Awards catalogue (for the attach picker).
export async function getAwardsCatalog(): Promise<AdminAward[]> {
  const admin = createAdminClient()
  const { data } = await admin.from('Awards').select('id, title').order('position', { ascending: true })
  return (data ?? []).map((a) => ({ id: a.id, title: a.title }))
}

function asBookStatus(raw: string | null | undefined): BookStatus {
  return raw === 'draft' || raw === 'archived' ? raw : 'published'
}

export type AdminBook = {
  id: number
  name: string
  slug: string | null
  status: BookStatus
  cover: string | null
  coverUrl: string | null
  description: string | null
  thesis: string | null
  ageRestriction: number | null
  firstRelease: string | null
  litForm: string | null
  isCompilation: boolean
  periodicalId: number | null
  volumeNumber: number | null
  volumeYear: string | null
  periodicals: { id: number; name: string }[]
  authors: { id: number; name: string }[]
  awards: AdminAward[]
  editions: AdminEdition[]
  trailer: { exists: boolean; hasPoster: boolean }
}

// Contributors linked to a single edition, ordered by sort_order.
async function fetchEditionWorkers(
  admin: ReturnType<typeof createAdminClient>,
  editionId: number
): Promise<AdminWorker[]> {
  const { data } = await admin
    .from('EditionWorkers')
    .select('id, worker_id, Workers(name, job)')
    .eq('edition_id', editionId)
    .order('sort_order', { ascending: true })
  return (data ?? [])
    .filter((r) => r.Workers)
    .map((r) => ({ linkId: r.id, workerId: r.worker_id, name: r.Workers!.name, job: r.Workers!.job }))
}

// Display order for a title's editions (matches the "add product" order).
const KIND_RANK = new Map<EditionKind, number>(ALL_EDITION_KINDS.map((k, i) => [k, i]))

export async function getAdminBook(id: number): Promise<AdminBook | null> {
  const admin = createAdminClient()

  const { data: title, error } = await admin.from('Titles').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить книгу: ${error.message}`)
  if (!title) return null

  // Authors via the link table.
  const { data: authorLinks } = await admin
    .from('Titles_Authors')
    .select('Authors(id, name)')
    .eq('title_id', id)
  const authors = (authorLinks ?? [])
    .map((l) => l.Authors)
    .filter((a): a is { id: number; name: string } => !!a)
    .map((a) => ({ id: a.id, name: a.name }))

  // Attached awards via the link table.
  const { data: awardLinks } = await admin
    .from('Titles_Awards')
    .select('position, Awards(id, title)')
    .eq('title_id', id)
    .order('position', { ascending: true })
  const awards = (awardLinks ?? [])
    .map((l) => l.Awards)
    .filter((a): a is { id: number; title: string } => !!a)
    .map((a) => ({ id: a.id, title: a.title }))

  // Booktrailer presence.
  const { data: trailerRow } = await admin
    .from('Booktrailers')
    .select('has_poster')
    .eq('title_id', id)
    .maybeSingle()
  const trailer = { exists: !!trailerRow, hasPoster: trailerRow?.has_poster ?? false }

  // Periodicals (for the «Периодика» selector).
  const { data: periodicalRows } = await admin
    .from('Periodicals')
    .select('id, name')
    .order('sort_order', { ascending: true })
  const periodicals = (periodicalRows ?? []).map((p) => ({ id: p.id, name: p.name }))

  // Editions: a single query against the unified Editions table.
  const { data: editionRows } = await admin
    .from('Editions')
    .select('id, kind, price, discount, is_published, sold_out, file_path, demo_path')
    .eq('title_id', id)

  const editions: AdminEdition[] = await Promise.all(
    ((editionRows ?? []) as Array<{
      id: number
      kind: string
      price: number | null
      discount: number | null
      is_published: boolean | null
      sold_out: boolean | null
      file_path: string | null
      demo_path: string | null
    }>)
      .filter((row): row is typeof row & { kind: EditionKind } => KIND_RANK.has(row.kind as EditionKind))
      .sort((a, b) => (KIND_RANK.get(a.kind as EditionKind)! - KIND_RANK.get(b.kind as EditionKind)!))
      .map(async (row) => {
        const kind = row.kind as EditionKind
        const hasFile = !!EDITION_FILE_FOLDER[kind]
        const hasDemo = !!EDITION_HAS_DEMO[kind]
        const hasSoldOut = !!EDITION_HAS_SOLD_OUT[kind]
        return {
          kind,
          id: row.id,
          label: EDITION_LABEL[kind],
          price: row.price == null ? null : Number(row.price),
          discount: row.discount == null ? null : Number(row.discount),
          isPublished: row.is_published ?? true,
          soldOut: hasSoldOut ? (row.sold_out ?? false) : null,
          hasSoldOut,
          hasFile,
          filePath: hasFile ? row.file_path : null,
          hasDemo,
          demoPath: hasDemo ? row.demo_path : null,
          workers: await fetchEditionWorkers(admin, row.id),
        }
      })
  )

  return {
    id: title.id,
    name: title.name,
    slug: title.slug,
    status: asBookStatus(title.status),
    cover: title.cover,
    coverUrl: getCoverUrl(title.cover),
    description: title.description,
    thesis: title.thesis,
    ageRestriction: title.age_restriction,
    firstRelease: title.first_release,
    litForm: title.lit_form,
    isCompilation: title.is_compilation,
    periodicalId: title.periodical_id,
    volumeNumber: title.volume_number,
    volumeYear: title.volume_year,
    periodicals,
    authors,
    awards,
    editions,
    trailer,
  }
}
