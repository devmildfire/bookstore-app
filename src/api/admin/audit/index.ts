import { createAdminClient } from '@/lib/supabase/server'
import { normalizeAuditEntry, type AdminAuditEntry } from '@/lib/admin/audit'

export type AuditEntryWithActor = AdminAuditEntry & { actorEmail: string | null }

export async function getAuditLog(limit = 100): Promise<AuditEntryWithActor[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('AdminAuditLog')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Не удалось загрузить журнал: ${error.message}`)

  const entries = (data ?? []).map(normalizeAuditEntry)

  // Resolve actor emails (a handful of distinct admins).
  const ids = Array.from(new Set(entries.map((e) => e.actorUserId).filter((v): v is string => !!v)))
  const emailById = new Map<string, string>()
  await Promise.all(
    ids.map(async (id) => {
      const { data: res } = await admin.auth.admin.getUserById(id)
      if (res.user?.email) emailById.set(id, res.user.email)
    })
  )

  return entries.map((e) => ({ ...e, actorEmail: e.actorUserId ? emailById.get(e.actorUserId) ?? null : null }))
}
