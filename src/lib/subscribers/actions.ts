'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { SITE_URL } from '@/lib/email/resend'
import NewsletterConfirm from '@/emails/NewsletterConfirm'

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

const schema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  source: z.string().max(50).optional(),
})

type SubscribeResult = { ok: true; already?: boolean } | { ok: false; error: string }

/**
 * Public mailing-list signup (double opt-in). Records the address as pending and
 * emails a confirmation link. Returns `already` when the address is already an
 * active subscriber (no email sent). Runs as service_role via the admin client;
 * the Subscribers table is otherwise RLS-locked.
 */
export async function subscribeAction(input: { email: string; source?: string }): Promise<SubscribeResult> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data, error } = await (admin.rpc as unknown as RpcFn)('subscribe_newsletter', {
    p_email: parsed.data.email,
    p_source: parsed.data.source ?? null,
  })
  if (error) return { ok: false, error: 'Не удалось оформить подписку' }

  const res = data as { status: string; confirm_token?: string }
  if (res.status === 'active') return { ok: true, already: true }
  if (res.status !== 'pending' || !res.confirm_token) {
    return { ok: false, error: 'Не удалось оформить подписку' }
  }

  const url = new URL('/newsletter/confirm', SITE_URL)
  url.searchParams.set('token', res.confirm_token)
  try {
    await sendEmail({
      to: parsed.data.email,
      subject: 'Подтвердите подписку — Чтиво',
      react: NewsletterConfirm({ confirmUrl: url.toString() }),
    })
  } catch (err) {
    console.error('[subscribe] confirm email failed:', err)
    return { ok: false, error: 'Не удалось отправить письмо подтверждения' }
  }
  return { ok: true }
}
