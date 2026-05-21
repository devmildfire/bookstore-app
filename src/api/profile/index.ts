// Client-safe runtime exports.
// Server-only helpers (getProfileServer) live in their own file and must be
// imported directly from `@/api/profile/getProfileServer` to avoid pulling
// `next/headers` into the client bundle.
export { getProfile, profileQueryKey } from './getProfile'
export { updateProfile } from './updateProfile'
export type { UpdateProfileInput } from './updateProfile'
export { setRecoveryEmail } from './setRecoveryEmail'
export type { SetRecoveryEmailResult } from './setRecoveryEmail'
