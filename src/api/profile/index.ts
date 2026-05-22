// Client-safe runtime exports only.
//
// Server-only helpers — getProfileServer, updateProfile, setRecoveryEmail —
// pull in next/headers (via @/lib/supabase/server) and must be imported
// directly from their own modules so they never reach a client bundle:
//   import { getProfileServer } from '@/api/profile/getProfileServer'
//   import { updateProfile }    from '@/api/profile/updateProfile'
//   import { setRecoveryEmail } from '@/api/profile/setRecoveryEmail'
export { getProfile, profileQueryKey } from './getProfile'
export type { UpdateProfileInput } from './updateProfile'
export type { SetRecoveryEmailResult } from './setRecoveryEmail'
