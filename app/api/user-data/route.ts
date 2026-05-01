import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [favRes, dlRes, purchaseRes] = await Promise.all([
    supabase.from('favorites').select('material_id').eq('user_id', user.id),
    supabase.from('download_history').select('material_id').eq('user_id', user.id),
    supabase.from('purchases').select('material_id').eq('user_id', user.id),
  ])

  return NextResponse.json({
    favIds: favRes.data?.map((d) => d.material_id) ?? [],
    dlIds: dlRes.data?.map((d) => d.material_id) ?? [],
    purchasedIds: purchaseRes.data?.map((d) => d.material_id) ?? [],
  })
}
