'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Profile } from '@/entities/profile/client'

type ProfileContextValue = {
  profile: Profile
  setProfile: (next: Profile) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

type Props = {
  initialProfile: Profile
  children: ReactNode
}

// Hydrates the profile fetched server-side in the /profile layout. Children
// read and mutate via useProfile(). Mutations call updateProfileAction and
// then push the returned row back through setProfile so the UI stays in sync
// without a refetch.
export function ProfileProvider({ initialProfile, children }: Props) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const value = useMemo(() => ({ profile, setProfile }), [profile])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return ctx
}

// For places that may not be inside a provider (e.g. checkout autofill that
// renders even when /profile is not in the route tree). Returns null instead
// of throwing.
export function useOptionalProfile(): Profile | null {
  const ctx = useContext(ProfileContext)
  return ctx?.profile ?? null
}
