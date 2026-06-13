import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { removeFromAudience } from '@/lib/email/audience'

type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

// One-click unsubscribe link target (carried in every marketing email).
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const result = (status: string) => NextResponse.redirect(new URL(`/newsletter?status=${status}`, request.url))

  if (!token) return result('invalid')

  const admin = createAdminClient()
  const { data, error } = await (admin.rpc as unknown as RpcFn)('unsubscribe_newsletter', { p_token: token })
  if (error) {
    console.error('[newsletter unsubscribe] rpc failed:', error.message)
    return result('error')
  }
  const res = data as { status: string; email?: string }
  if (res.status !== 'ok' || !res.email) return result('invalid')

  await removeFromAudience(res.email)
  return result('unsubscribed')
}
