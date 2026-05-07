'use client'
import { useEffect } from 'react'
import { useAuth } from '@/app/[locale]/AuthContext'

type Props = {
  user: { id: string; email: string; user_metadata: Record<string, any>; identities: { provider: string }[] } | null
  profile: any
}

export default function AuthHydrator({ user, profile }: Props) {
  const { initializeAuth } = useAuth()
  useEffect(() => {
    initializeAuth(user, profile)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
