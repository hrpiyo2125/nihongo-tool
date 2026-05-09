import { NextResponse } from 'next/server'
import { getMaterialById, getMaterials } from '@/lib/notion'

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const material = await getMaterialById(id)

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