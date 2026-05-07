import { createClient as createServerClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import AuthHydrator from './AuthHydrator'

export default async function AuthInitializer() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <AuthHydrator user={null} profile={null} />

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: profileData } = await service
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const serverUser = {
      id: user.id,
      email: user.email ?? '',
      user_metadata: user.user_metadata ?? {},
      identities: (user.identities ?? []) as { provider: string }[],
    }
    const profile = profileData?.status !== 'deleted' ? profileData : null

    return <AuthHydrator user={serverUser} profile={profile} />
  } catch {
    return <AuthHydrator user={null} profile={null} />
  }
}
