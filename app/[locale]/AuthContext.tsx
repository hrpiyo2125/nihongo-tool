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
  avatar_url?: string | null
  [key: string]: any
}

type AuthContextType = {
  isLoggedIn: boolean
  isAuthLoading: boolean
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
  authProviders: string[]
  loadProfile: () => Promise<void>
  updateProfile: (partial: Partial<Profile>) => void
  setFavIds: React.Dispatch<React.SetStateAction<string[]>>
  setUserName: React.Dispatch<React.SetStateAction<string>>
  setUserInitial: React.Dispatch<React.SetStateAction<string>>
  setAvatarUrl: React.Dispatch<React.SetStateAction<string | null>>
  initializeAuth: (user: { id: string; email: string; user_metadata: Record<string, any>; identities: { provider: string }[] } | null, profile: any) => void
}

const defaultProfile: Profile = {
  full_name: '', country: '', city: '', purpose: [],
  occupation: '', student_level: '', occupation_other: '', purpose_other: '',
  plan: 'free', plan_status: 'active', cancel_at_period_end: false,
  current_period_end: null, trial_end: null, status: 'active', avatar_url: null, has_password: false,
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAuthLoading: true,
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
  authProviders: [],
  loadProfile: async () => {},
  updateProfile: () => {},
  setFavIds: () => {},
  setUserName: () => {},
  setUserInitial: () => {},
  setAvatarUrl: () => {},
  initializeAuth: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()

  const buildProfile = (data: any): Profile => ({
    full_name: data?.full_name || '', country: data?.country || '',
    city: data?.city || '', purpose: data?.purpose || [],
    occupation: data?.occupation || '', student_level: data?.student_level || '',
    occupation_other: data?.occupation_other || '', purpose_other: data?.purpose_other || '',
    plan: data?.plan || 'free', plan_status: data?.plan_status || 'active',
    cancel_at_period_end: data?.cancel_at_period_end ?? false,
    current_period_end: data?.current_period_end || null,
    trial_end: data?.trial_end || null,
    status: data?.status || 'active',
    avatar_url: data?.avatar_url ?? null,
    has_password: data?.has_password ?? false,
  })

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [authProviders, setAuthProviders] = useState<string[]>([])
  const [userName, setUserName] = useState('ゲスト')
  const [userInitial, setUserInitial] = useState('？')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [favIds, setFavIds] = useState<string[]>([])
  const [favIdsLoaded, setFavIdsLoaded] = useState(false)
  const [dlIds, setDlIds] = useState<string[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])

  // サーバーストリーム（AuthInitializer）からデータを受け取る
  const initializeAuth = useCallback((
    user: { id: string; email: string; user_metadata: Record<string, any>; identities: { provider: string }[] } | null,
    profileData: any
  ) => {
    if (user) {
      setIsLoggedIn(true)
      setUserId(user.id)
      setUserEmail(user.email)
      setAuthProviders(user.identities?.map(i => i.provider) ?? [])
      const name = profileData?.full_name || user.user_metadata?.full_name || user.email.split('@')[0] || 'ゲスト'
      setUserName(name)
      setUserInitial(name.charAt(0).toUpperCase() || '？')
      setAvatarUrl(profileData?.avatar_url ?? null)
      if (profileData) setProfile(buildProfile(profileData))
    }
  }, [])

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
      avatar_url: data.avatar_url ?? null,
      has_password: data.has_password ?? false,
    })
    if (data.full_name) { setUserName(data.full_name); setUserInitial(data.full_name.charAt(0).toUpperCase()) }
    if (data.avatar_url) setAvatarUrl(data.avatar_url)
  }, [])

  const updateProfile = useCallback((partial: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...partial }))
    if (partial.avatar_url !== undefined) setAvatarUrl(partial.avatar_url ?? null)
  }, [])

  const loadProfile = useCallback(async () => {
    try {
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
    } catch {
      // バックグラウンド更新なので失敗しても継続
    }
  }, [locale, applyProfile])

  useEffect(() => {
    const supabase = createClient()
    let loaded = false

    const loadUserData = async (user: { id: string; email?: string; user_metadata?: Record<string, any>; identities?: { provider: string }[] }, accessToken?: string) => {
      if (loaded) return
      loaded = true
      setIsLoggedIn(true)
      setUserId(user.id)
      setUserEmail(user.email ?? '')
      setAuthProviders(user.identities?.map(i => i.provider) ?? [])
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
      setUserName(displayName)
      setUserInitial(displayName.charAt(0).toUpperCase())

      if (!accessToken) { setFavIdsLoaded(true); return }

      try {
        const [profileRes, userDataRes] = await Promise.all([
          fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/user-data', { headers: { Authorization: `Bearer ${accessToken}` } }),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          if (data.deleted) { window.location.href = `/${locale}/welcome-back`; return }
          applyProfile(data)
        }

        if (userDataRes.ok) {
          const data = await userDataRes.json()
          setFavIds(data.favIds ?? [])
          setDlIds([...new Set((data.dlIds ?? []) as string[])])
          setPurchasedIds([...new Set((data.purchasedIds ?? []) as string[])])
        }
      } catch {
        // ネットワーク障害時もUIのロックを防ぐため必ず解除
      } finally {
        setFavIdsLoaded(true)
      }
    }

    const refreshUserData = async (accessToken: string) => {
      try {
        const [profileRes, userDataRes] = await Promise.all([
          fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch('/api/user-data', { headers: { Authorization: `Bearer ${accessToken}` } }),
        ])
        if (profileRes.ok) {
          const data = await profileRes.json()
          if (!data.deleted) applyProfile(data)
        }
        if (userDataRes.ok) {
          const data = await userDataRes.json()
          setFavIds(data.favIds ?? [])
          setDlIds([...new Set((data.dlIds ?? []) as string[])])
          setPurchasedIds([...new Set((data.purchasedIds ?? []) as string[])])
        }
      } catch {
        // バックグラウンド更新なので失敗しても継続
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        await refreshUserData(session.access_token)
      } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        await loadUserData(session.user, session.access_token)
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
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
        setAuthProviders([])
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserData(session.user, session.access_token)
      else setFavIdsLoaded(true)
    })

    return () => subscription.unsubscribe()
  }, [locale, applyProfile])

  return (
    <AuthContext.Provider value={{
      isLoggedIn, isAuthLoading: !favIdsLoaded,
      userId, userEmail, userName, userInitial, avatarUrl,
      profile, favIds, favIdsLoaded, dlIds, purchasedIds,
      authProviders,
      loadProfile, updateProfile, initializeAuth,
      setFavIds, setUserName, setUserInitial, setAvatarUrl,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
