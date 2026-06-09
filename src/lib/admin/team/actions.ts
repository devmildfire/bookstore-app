'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'
import { getWorkerPhotoUrl, WORKERS_BUCKET } from '@/lib/storage'

export type TeamActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const IMAGE_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите имя'),
  job: z.string().trim().min(1, 'Введите должность'),
})

export async function createTeamMemberAction(
  _prev: TeamActionResult | null,
  formData: FormData
): Promise<TeamActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name'), job: formData.get('job') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: last } = await admin
    .from('Workers')
    .select('sort_order')
    .eq('is_team_member', true)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = (last?.sort_order ?? -1) + 1

  // (name, job) is unique; upsert promotes an existing book-contributor row to a
  // team member rather than failing on a duplicate person.
  const { data, error } = await admin
    .from('Workers')
    .upsert(
      { name: parsed.data.name, job: parsed.data.job, is_team_member: true, sort_order: sortOrder },
      { onConflict: 'name,job' }
    )
    .select('id')
    .single()
  if (error || !data) return { status: 'error', message: error?.message ?? 'Не удалось создать участника.' }

  await logAdminAction({
    actorUserId: user.id,
    action: 'team.create',
    entityType: 'worker',
    entityId: String(data.id),
    summary: `Добавлен участник команды «${parsed.data.name}»`,
  })
  revalidatePath('/admin/team')
  revalidatePath('/about')
  redirect(`/admin/team/${data.id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите имя'),
  job: z.string().trim().min(1, 'Введите должность'),
  city: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable(),
  position: z.coerce.number().int().min(0),
})

export async function updateTeamMemberAction(
  _prev: TeamActionResult | null,
  formData: FormData
): Promise<TeamActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    job: formData.get('job'),
    city: formData.get('city'),
    position: formData.get('position'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('Workers')
    .update({ name: d.name, job: d.job, city: d.city, sort_order: d.position })
    .eq('id', d.id)
  if (error) {
    const msg = error.message.includes('duplicate')
      ? 'Участник с таким именем и должностью уже существует.'
      : error.message
    return { status: 'error', message: msg }
  }

  revalidatePath(`/admin/team/${d.id}`)
  revalidatePath('/admin/team')
  revalidatePath('/about')
  return { status: 'ok' }
}

// "Remove from team" — clears is_team_member rather than deleting the Workers
// row, because the same person may be a book contributor (its *Workers links are
// ON DELETE CASCADE). Re-adding via the create form re-promotes the row.
export async function removeTeamMemberAction(
  _prev: TeamActionResult | null,
  formData: FormData
): Promise<TeamActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: worker } = await admin.from('Workers').select('name').eq('id', id).maybeSingle()
  const { error } = await admin.from('Workers').update({ is_team_member: false }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'team.remove',
    entityType: 'worker',
    entityId: String(id),
    summary: `Убран из команды «${worker?.name ?? id}»`,
  })
  revalidatePath('/admin/team')
  revalidatePath('/about')
  redirect('/admin/team')
}

// Upload a team-member photo (PNG/JPG/WEBP) to the workers bucket and store its
// bare filename. Photos render color, grayscale→hover on the About page.
export async function uploadTeamPhotoAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('memberId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = IMAGE_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только PNG, JPEG или WEBP.' }
  if (file.size > 5 * 1024 * 1024) return { status: 'error', message: 'Файл больше 5 МБ.' }

  const admin = createAdminClient()
  const filename = `member-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(WORKERS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const { error } = await admin.from('Workers').update({ photo_path: filename }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/team/${id}`)
  revalidatePath('/admin/team')
  revalidatePath('/about')
  return { status: 'ok', url: `${getWorkerPhotoUrl(filename)}?v=${Date.now()}` }
}
