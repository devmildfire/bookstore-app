// Short-lived cookie that carries the anonymous UID across the OAuth
// round-trip so /auth/callback can migrate the anon's cart/orders onto the
// resolved user. Lives outside actions.ts because 'use server' files may
// only export async functions.
export const PENDING_ANON_COOKIE = 'sb-pending-anon-id'
