import { createClient } from '@supabase/supabase-js'
import { getMaterials, getMaterialById } from '@/lib/notion'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchPageCountMap(): Promise<Record<string, number>> {
  const { data } = await serviceClient()
    .from('material_page_counts')
    .select('material_id, page_count')
  const map: Record<string, number> = {}
  for (const row of data ?? []) {
    map[row.material_id] = row.page_count
  }
  return map
}

export async function getMaterialsWithPageCount() {
  const [materials, pageCountMap] = await Promise.all([
    getMaterials(),
    fetchPageCountMap(),
  ])
  return materials.map(m => ({ ...m, pageCount: pageCountMap[m.id] ?? null }))
}

export async function getMaterialByIdWithPageCount(id: string) {
  const [material, pageCountMap] = await Promise.all([
    getMaterialById(id),
    fetchPageCountMap(),
  ])
  return { ...material, pageCount: pageCountMap[id] ?? null }
}
