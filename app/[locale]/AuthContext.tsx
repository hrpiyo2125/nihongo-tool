"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '../../lib/supabase'
import { useLocale } from 'next-intl'

type Profile = {
  full_name?: string
  country?: string
  city?: string
  purpose?: string[]
  occupation?: string
  student_level?: string
  occupation_other?: string
  purpose_other?: string
  plan?: string
  plan_status?: string
  cancel_at_period_end?: boolean
  current_period_end?: string | null
  trial_end?: string | null
  status?: string
  avatar_url?: string
  [key: string]: any
}

type AuthContextType = {
  authReady: boolean
  isLoggedIn: boolean
  userId: string
  userEmail: string
  userName: string
  userInitial: string
  avatarUrl: string | null
  profile: Profile
  favIds: string[]
  favIdsLoaded: boolean
  dlIds: string[]
  purchasedIds: string[]
  loadProfile: () => Promise<void>
  setFavIds: React.Dispatch<React.SetStateAction<string[]>>
  setUserName: React.Dispatch<React.SetStateAction<string>>
  setUserInitial: React.Dispatch<React.SetStateAction<string>>
  setAvatarUrl: React.Dispatch<React.SetStateAction<string | null>>
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

const defaultProfile: Profile = {
  full_name: '', country: '', city: '', purpose: [],
  occupation: '', student_level: '', occupation_other: '', purpose_other: '',
  plan: 'free', plan_status: 'active', cancel_at_period_end: false,
  current_period_end: null, trial_end: null, status: 'active',
}

const AuthContext = createContext<AuthContextType>({
  authReady: false,
  isLoggedIn: false,
  userId: '',
  userEmail: '',
  userName: 'ゲスト',
  userInitial: '？',
  avatarUrl: null,
  profile: defaultProfile,
  favIds: [],
  favIdsLoaded: false,
  dlIds: [],
  purchasedIds: [],
  loadProfile: async () => {},
  setFavIds: () => {},
  setUserName: () => {},
  setUserInitial: () => {},
  setAvatarUrl: () => {},
  setProfile: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('ゲスト')
  const [userInitial, setUserInitial] = useState('？')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [authReady, setAuthReady] = useState(false)
  const [favIds, setFavIds] = useState<string[]>([])
  const [favIdsLoaded, setFavIdsLoaded] = useState(false)
  const [dlIds, setDlIds] = useState<string[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])

  const applyProfile = useCallback((data: any) => {
    setProfile({
      full_name: data.full_name || '',
      country: data.country || '',
      city: data.city || '',
      purpose: data.purpose || [],
      occupation: data.occupation || '',
      student_level: data.student_level || '',
      occupation_other: data.occupation_other || '',
      purpose_other: data.purpose_other || '',
      plan: data.plan || 'free',
      plan_status: data.plan_status || 'active',
      cancel_at_period_end: data.cancel_at_period_end ?? false,
      current_period_end: data.current_period_end || null,
      trial_end: data.trial_end || null,
      status: data.status || 'active',
    })
    if (data.full_name) { setUserName(data.full_name); setUserInitial(data.full_name.charAt(0).toUpperCase()) }
    if (data.avatar_url) setAvatarUrl(data.avatar_url)
  }, [])

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    const res = await fetch('/api/profile', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    if (data.deleted) { window.location.href = `/${locale}/welcome-back`; return }
    applyProfile(data)
  }, [locale, applyProfile])

  useEffect(() => {
    const supabase = createClient()
    let loaded = false

    const loadUserData = async (user: { id: string; email?: string; user_metadata?: Record<string, any> }, accessToken?: string) => {
      if (loaded) return
      loaded = true

      setIsLoggedIn(true)
      setUserId(user.id)
      setUserEmail(user.email ?? '')
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      setUserName(displayName)
      setUserInitial(displayName.charAt(0).toUpperCase())

      const profilePromise = accessToken
        ? fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (!data) return
              if (data.deleted) { window.location.href = `/${locale}/welcome-back`; return }
              applyProfile(data)
            })
        : Promise.resolve()

      const [, favRes, dlRes, purchaseRes] = await Promise.all([
        profilePromise,
        supabase.from('favorites').select('material_id').eq('user_id', user.id),
        supabase.from('download_history').select('material_id').eq('user_id', user.id),
        supabase.from('purchases').select('material_id').eq('user_id', user.id),
      ])
      if (favRes.data) setFavIds(favRes.data.map((d: any) => d.material_id))
      setFavIdsLoaded(true)
      if (dlRes.data) setDlIds([...new Set(dlRes.data.map((d: any) => d.material_id as string))])
      if (purchaseRes.data) setPurchasedIds([...new Set(purchaseRes.data.map((d: any) => d.material_id as string))])
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        await loadUserData(session.user, session.access_token)
      } else if (event === 'SIGNED_OUT') {
        loaded = false
        setIsLoggedIn(false)
        setFavIds([])
        setFavIdsLoaded(true)
        setDlIds([])
        setPurchasedIds([])
        setProfile(defaultProfile)
        setUserName('ゲスト')
        setUserInitial('？')
        setUserId('')
        setUserEmail('')
        setAvatarUrl(null)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user, session.access_token)
      setAuthReady(true)
    })

    return () => subscription.unsubscribe()
  }, [locale, applyProfile])

  return (
    <AuthContext.Provider value={{
      authReady, isLoggedIn, userId, userEmail, userName, userInitial, avatarUrl,
      profile, favIds, favIdsLoaded, dlIds, purchasedIds, loadProfile,
      setFavIds, setUserName, setUserInitial, setAvatarUrl, setProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
