import { NextResponse } from 'next/server'
import { getMaterials } from '@/lib/notion'
import { getMaterialByIdWithPageCount } from '@/lib/materials'

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const material = await getMaterialByIdWithPageCount(id)

    let relatedMaterials: any[] = []
    if (material.relatedMaterialIds?.length > 0) {
      const allMaterials = await getMaterials()
      relatedMaterials = material.relatedMaterialIds
        .map((rid: string) => allMaterials.find((m) => m.id === rid))
        .filter(Boolean)
    }

    return NextResponse.json({ ...material, relatedMaterials })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}