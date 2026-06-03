'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  orderId: z.coerce.number().int().positive(),
  status: z.enum(['processing', 'shipped', 'delivered', 'completed']),
  trackingNumber: z.string().max(120).optional(),
  carrier: z.string().max(120).optional(),
  note: z.string().max(2000).optional(),
})

export type FulfillmentResult = { status: 'ok' } | { status: 'error'; message: string }

// Advance an order's fulfillment + attach tracking/note. Gated on admin role,
// then written via the service-role RPC which also records the audit entry.
export async function setOrderFulfillmentAction(
  _prev: FulfillmentResult | null,
  formData: FormData
): Promise<FulfillmentResult> {
  const user = await requireAdmin()

  const parsed = schema.safeParse({
    orderId: formData.get('orderId'),
    status: formData.get('status'),
    trackingNumber: (formData.get('trackingNumber') as string) || undefined,
    carrier: (formData.get('carrier') as string) || undefined,
    note: (formData.get('note') as string) || undefined,
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  // The RPC normalizes empty strings to NULL (coalesce/NULLIF), so pass '' for
  // omitted fields — its generated param types are non-null text.
  const { data, error } = await admin.rpc('admin_set_order_fulfillment', {
    p_order_id: parsed.data.orderId,
    p_status: parsed.data.status,
    p_tracking_number: parsed.data.trackingNumber ?? '',
    p_carrier: parsed.data.carrier ?? '',
    p_note: parsed.data.note ?? '',
    p_actor: user.id,
  })
  if (error) return { status: 'error', message: error.message }

  const result = data as { status?: string; reason?: string } | null
  if (result?.status !== 'ok') {
    return { status: 'error', message: result?.reason ?? 'Не удалось обновить заказ.' }
  }

  revalidatePath(`/admin/orders/${parsed.data.orderId}`)
  revalidatePath('/admin/orders')
  return { status: 'ok' }
}
