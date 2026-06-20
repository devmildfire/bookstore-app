'use server'

import { z } from 'zod'
import sharp from 'sharp'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { parseContentBlocks } from '@/lib/admin/articleContent'
import { createAdminClient } from '@/lib/supabase/server'
import { getArticleImageUrl } from '@/lib/storage'
import type { Json } from '@/types/supabase'

export type ArticleActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const ARTICLES_BUCKET = 'articles'
const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_IMAGE_BYTES = 20 * 1024 * 1024

async function nextId(admin: ReturnType<typeof createAdminClient>, table: string): Promise<number> {
  const b = admin.from(table as 'Articles') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await b.select('id').order('id', { ascending: false }).limit(1)
  return (res.data?.[0]?.id ?? 0) + 1
}

const createSchema = z.object({
  title: z.string().trim().min(1, 'Введите заголовок'),
  slug: z.string().trim().min(1, 'Введите slug').regex(/^[a-z0-9-]+$/, 'Slug: латиница, цифры, дефис'),
  authorId: z.coerce.number().int().positive('Выберите автора'),
})

export async function createArticleAction(_prev: ArticleActionResult | null, formData: FormData): Promise<ArticleActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    authorId: formData.get('authorId'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'Articles')
  const { error } = await admin.from('Articles').insert({
    id,
    title: parsed.data.title,
    slug: parsed.data.slug,
    author_id: parsed.data.authorId,
    content_blocks: [] as Json,
    published_at: new Date().toISOString(),
  })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Статья с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  await logAdminAction({
    actorUserId: user.id,
    action: 'article.create',
    entityType: 'article',
    entityId: String(id),
    summary: `Создана статья «${parsed.data.title}»`,
  })
  revalidatePath('/admin/articles')
  redirect(`/admin/articles/${id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, 'Введите заголовок'),
  slug: z.string().trim().min(1, 'Введите slug'),
  authorId: z.coerce.number().int().positive(),
  excerpt: z.string().optional(),
  publishedAt: z.string().min(1, 'Укажите дату публикации'),
  content: z.string().optional(),
})

export async function updateArticleAction(_prev: ArticleActionResult | null, formData: FormData): Promise<ArticleActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    authorId: formData.get('authorId'),
    excerpt: (formData.get('excerpt') as string) || undefined,
    publishedAt: formData.get('publishedAt'),
    content: (formData.get('content') as string) || undefined,
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  // The Lexical editor serializes content_blocks as a JSON string.
  const blocks = parseContentBlocks(d.content ?? '')
  const publishedAt = new Date(d.publishedAt)
  if (Number.isNaN(publishedAt.getTime())) return { status: 'error', message: 'Неверная дата.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('Articles')
    .update({
      title: d.title,
      slug: d.slug,
      author_id: d.authorId,
      excerpt: d.excerpt ?? null,
      content_blocks: blocks as Json,
      published_at: publishedAt.toISOString(),
    })
    .eq('id', d.id)
  if (error) return { status: 'error', message: error.message }

  // Remove this article's uploaded content images that are no longer used.
  const referenced = new Set(blocks.filter((b) => b.kind === 'image').map((b) => b.path))
  await cleanupContentImages(admin, d.id, referenced)

  revalidatePath(`/admin/articles/${d.id}`)
  revalidatePath('/admin/articles')
  revalidatePath(`/dino-magazine/${d.slug}`)
  revalidatePath('/dino-magazine')
  return { status: 'ok' }
}

// Delete `article-{id}-content-*` objects in the articles bucket that aren't in
// `keep`. Scoped to our own upload naming, so covers and legacy/shared images
// are never touched. Best effort — never blocks the save.
async function cleanupContentImages(
  admin: ReturnType<typeof createAdminClient>,
  articleId: number,
  keep: Set<string>
): Promise<void> {
  try {
    const prefix = `article-${articleId}-content-`
    const { data: objects } = await admin.storage.from(ARTICLES_BUCKET).list('', { limit: 1000, search: prefix })
    const orphans = (objects ?? [])
      .map((o) => o.name)
      .filter((name) => name.startsWith(prefix) && !keep.has(name))
    if (orphans.length > 0) await admin.storage.from(ARTICLES_BUCKET).remove(orphans)
  } catch {
    // ignore — cleanup must not break the operation
  }
}

export async function deleteArticleAction(_prev: ArticleActionResult | null, formData: FormData): Promise<ArticleActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: art } = await admin.from('Articles').select('title, cover_path').eq('id', id).maybeSingle()
  if (art?.cover_path) await admin.storage.from(ARTICLES_BUCKET).remove([art.cover_path]).catch(() => {})
  await cleanupContentImages(admin, id, new Set())
  const { error } = await admin.from('Articles').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'article.delete',
    entityType: 'article',
    entityId: String(id),
    summary: `Удалена статья «${art?.title ?? id}»`,
  })
  revalidatePath('/admin/articles')
  redirect('/admin/articles')
}

export async function uploadArticleCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('articleId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_IMAGE_BYTES) return { status: 'error', message: 'Файл больше 20 МБ.' }

  const admin = createAdminClient()
  const filename = `article-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(ARTICLES_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  let blur: string | null = null
  let width: number | null = null
  let height: number | null = null
  try {
    const meta = await sharp(buffer).metadata()
    width = meta.width ?? null
    height = meta.height ?? null
    blur = await makeBlurDataUrl(buffer)
  } catch {
    // best effort
  }
  const { error } = await admin
    .from('Articles')
    .update({ cover_path: filename, cover_blur: blur, cover_width: width, cover_height: height })
    .eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/articles/${id}`)
  revalidatePath('/admin/articles')
  return { status: 'ok', url: `${getArticleImageUrl(filename)}?v=${Date.now()}` }
}

export type ContentImageResult = { status: 'ok'; path: string } | { status: 'error'; message: string }

// Upload an inline content image to the articles bucket; returns the bare
// object name (the editor inserts it into the text as an [img: …] marker).
export async function uploadArticleContentImageAction(formData: FormData): Promise<ContentImageResult> {
  await requireAdmin()
  const id = Number(formData.get('articleId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_IMAGE_BYTES) return { status: 'error', message: 'Файл больше 20 МБ.' }

  const admin = createAdminClient()
  const filename = `article-${id}-content-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await admin.storage
    .from(ARTICLES_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (error) return { status: 'error', message: error.message }
  return { status: 'ok', path: filename }
}
