import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { AdminEditionPhotos } from '@/api/admin/books'
import { ALL_EDITION_KINDS, type EditionKind } from '@/lib/admin/bookProducts'
import type { createAdminClient } from '@/lib/supabase/server'

export type AdminActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }
export type PhotosResult = { status: 'ok'; photos: AdminEditionPhotos } | { status: 'error'; message: string }

export const coreSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug'),
  description: z.string().optional(),
  thesis: z.string().optional(),
  ageRestriction: z.coerce.number().int().min(0).max(21).optional(),
  firstRelease: z.string().optional(),
  litForm: z.string().optional(),
  isCompilation: z.boolean(),
})

export const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
  slug: z
    .string()
    .trim()
    .min(1, 'Введите slug')
    .regex(/^[a-z0-9-]+$/, 'Slug: только латиница, цифры и дефис'),
})

export const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['draft', 'published', 'archived']),
})

export const workerSchema = z.object({
  titleId: z.coerce.number().int().positive(),
  editionId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите имя'),
  job: z.string().trim().min(1, 'Введите роль'),
})

export const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const MAX_COVER_BYTES = 20 * 1024 * 1024
export const MAX_PHOTO_BYTES = 20 * 1024 * 1024
export const MAX_DIGITAL_BYTES = 1024 * 1024 * 1024
export const MAX_DEMO_BYTES = 50 * 1024 * 1024

export const DIGITAL_FILES_BUCKET = 'digital-files'
export const DEMOS_BUCKET = 'demos'
export const BOOKTRAILERS_BUCKET = 'booktrailers'

export const TRAILER_FILE: Record<string, { name: string; type: string }> = {
  mp4: { name: 'video.mp4', type: 'video/mp4' },
  webm: { name: 'video.webm', type: 'video/webm' },
  poster: { name: 'poster.jpg', type: 'image/jpeg' },
}

export type LooseWriter = {
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  delete: () => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
}

export function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = (v as string | null)?.trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function asEditionKind(v: FormDataEntryValue | null): EditionKind | null {
  return ALL_EDITION_KINDS.includes(v as EditionKind) ? (v as EditionKind) : null
}

export function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v
  }
  return out
}

export function nextPhotoIndex(names: string[]): number {
  let max = 0
  for (const n of names) {
    const m = n.match(/^(\d+)/)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

export async function nextId(
  admin: ReturnType<typeof createAdminClient>,
  table: string
): Promise<number> {
  const builder = admin.from(table as 'Titles') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await builder.select('id').order('id', { ascending: false }).limit(1)
  return (res.data?.[0]?.id ?? 0) + 1
}

export async function revalidateBookBySlug(
  admin: ReturnType<typeof createAdminClient>,
  titleId: number
) {
  const { data } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (data?.slug) revalidatePath(`/books/${data.slug}`)
}
