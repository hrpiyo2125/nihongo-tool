import { NextResponse } from 'next/server'
import { getMaterials } from '@/lib/notion'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const [materials, pageCountsResult] = await Promise.all([
      getMaterials(),
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ).from('material_page_counts').select('material_id, page_count'),
    ])

    const pageCountMap: Record<string, number> = {}
    for (const row of pageCountsResult.data ?? []) {
      pageCountMap[row.material_id] = row.page_count
    }

    const merged = materials.map(m => ({
      ...m,
      pageCount: pageCountMap[m.id] ?? null,
    }))

    return NextResponse.json(merged)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}
