'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createAuthClient } from '@/lib/supabase/client'

type UseSupabaseUserResult = {
  user: User | null
  isLoading: boolean
  isAnonymous: boolean
}

export default function useSupabaseUser(): UseSupabaseUserResult {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createAuthClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isAnonymous = user?.is_anonymous ?? true

  return { user, isLoading, isAnonymous }
}