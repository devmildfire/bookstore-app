'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { createAdminClient } from '@/lib/supabase/server'
import { getAuthorPhotoUrl } from '@/lib/storage'
import { AUTHOR_CONTACT_CHANNELS } from '@/lib/admin/authorContacts'

export type AuthorActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const AUTHORS_BUCKET = 'authors'
const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

type LooseWriter = {
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  delete: () => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
}

async function nextId(admin: ReturnType<typeof createAdminClient>, table: string): Promise<number> {
  const b = admin.from(table as 'Authors') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await b.select('id').order('id', { ascending: false }).limit(1)
  return (res.data?.[0]?.id ?? 0) + 1
}

const createSchema = z.object({ name: z.string().trim().min(1, 'Введите имя автора') })

export async function createAuthorAction(_prev: AuthorActionResult | null, formData: FormData): Promise<AuthorActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'Authors')
  const { error } = await admin.from('Authors').insert({ id, name: parsed.data.name, nonsalable: false })
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'author.create',
    entityType: 'author',
    entityId: String(id),
    summary: `Создан автор «${parsed.data.name}»`,
  })
  revalidatePath('/admin/authors')
  redirect(`/admin/authors/${id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите имя автора'),
  bio: z.string().optional(),
  birthDate: z.string().optional(),
  deathDate: z.string().optional(),
  city: z.string().optional(),
  phrase: z.string().optional(),
  nonsalable: z.boolean(),
})

export async function updateAuthorAction(_prev: AuthorActionResult | null, formData: FormData): Promise<AuthorActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    bio: (formData.get('bio') as string) || undefined,
    birthDate: (formData.get('birthDate') as string) || undefined,
    deathDate: (formData.get('deathDate') as string) || undefined,
    city: (formData.get('city') as string) || undefined,
    phrase: (formData.get('phrase') as string) || undefined,
    nonsalable: formData.get('nonsalable') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('Authors')
    .update({
      name: d.name,
      bio: d.bio ?? null,
      birth_date: d.birthDate ?? null,
      death_date: d.deathDate ?? null,
      city: d.city ?? null,
      phrase: d.phrase ?? null,
      nonsalable: d.nonsalable,
    })
    .eq('id', d.id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/authors/${d.id}`)
  revalidatePath('/admin/authors')
  revalidatePath(`/authors/${d.id}`)
  return { status: 'ok' }
}

// Hard-delete — blocked while the author is still linked to any title (would
// otherwise silently unlink those books via cascade).
export async function deleteAuthorAction(_prev: AuthorActionResult | null, formData: FormData): Promise<AuthorActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { count } = await admin
    .from('Titles_Authors')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', id)
  if ((count ?? 0) > 0) {
    return { status: 'error', message: `Автор привязан к ${count} книгам. Сначала отвяжите их.` }
  }

  const { data: author } = await admin.from('Authors').select('name, photo').eq('id', id).maybeSingle()
  if (author?.photo) await admin.storage.from(AUTHORS_BUCKET).remove([author.photo]).catch(() => {})
  const { error } = await admin.from('Authors').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'author.delete',
    entityType: 'author',
    entityId: String(id),
    summary: `Удалён автор «${author?.name ?? id}»`,
  })
  revalidatePath('/admin/authors')
  redirect('/admin/authors')
}

export async function uploadAuthorPhotoAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('authorId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id автора.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_PHOTO_BYTES) return { status: 'error', message: 'Файл больше 10 МБ.' }

  const admin = createAdminClient()
  const filename = `author-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(AUTHORS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  let blur: string | null = null
  try {
    blur = await makeBlurDataUrl(buffer)
  } catch {
    blur = null
  }
  const { error } = await admin.from('Authors').update({ photo: filename, photo_blur: blur }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/authors/${id}`)
  revalidatePath('/admin/authors')
  return { status: 'ok', url: `${getAuthorPhotoUrl(filename)}?v=${Date.now()}` }
}

const contactSchema = z.object({
  authorId: z.coerce.number().int().positive(),
  channel: z.enum(AUTHOR_CONTACT_CHANNELS),
  url: z.string().trim().min(1, 'Введите ссылку'),
})

export async function addAuthorContactAction(formData: FormData): Promise<AuthorActionResult> {
  await requireAdmin()
  const parsed = contactSchema.safeParse({
    authorId: formData.get('authorId'),
    channel: formData.get('channel'),
    url: formData.get('url'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { count } = await admin
    .from('AuthorContacts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', parsed.data.authorId)
  const id = await nextId(admin, 'AuthorContacts')
  const writer = admin.from('AuthorContacts') as unknown as LooseWriter
  const { error } = await writer.insert({
    id,
    author_id: parsed.data.authorId,
    channel: parsed.data.channel,
    url: parsed.data.url,
    sort_order: count ?? 0,
  })
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/authors/${parsed.data.authorId}`)
  return { status: 'ok' }
}

export async function removeAuthorContactAction(formData: FormData): Promise<AuthorActionResult> {
  await requireAdmin()
  const authorId = Number(formData.get('authorId'))
  const contactId = Number(formData.get('contactId'))
  if (!Number.isInteger(contactId) || contactId <= 0) return { status: 'error', message: 'Неверный контакт.' }

  const admin = createAdminClient()
  const { error } = await admin.from('AuthorContacts').delete().eq('id', contactId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/authors/${authorId}`)
  return { status: 'ok' }
}
