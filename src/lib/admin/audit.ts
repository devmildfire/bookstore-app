import type { Database, Json } from '@/types/supabase'
import { createAdminClient } from '@/lib/supabase/server'

type AdminAuditRow = Database['public']['Tables']['AdminAuditLog']['Row']

export type AdminAuditEntry = {
  id: number
  actorUserId: string | null
  action: string
  entityType: string
  entityId: string
  summary: string
  metadata: Record<string, unknown>
  createdAt: string
}

export function normalizeAuditEntry(row: AdminAuditRow): AdminAuditEntry {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    summary: row.summary,
    metadata: (row.metadata as Record<string, unknown> | null) ?? {},
    createdAt: row.created_at,
  }
}

// Service-role write for destructive/admin actions that don't have their own
// RPC (the order fulfillment RPC logs inline). Caller MUST have already passed
// requireAdmin(). Best-effort: a logging failure never blocks the action.
export async function logAdminAction(input: {
  actorUserId: string
  action: string
  entityType: string
  entityId: string
  summary: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('AdminAuditLog').insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      summary: input.summary,
      metadata: (input.metadata ?? {}) as unknown as Json,
    })
  } catch {
    // Audit logging must never break the underlying admin operation.
  }
}
