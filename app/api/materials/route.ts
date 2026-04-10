import { NextResponse } from 'next/server'
import { getMaterials } from '@/lib/notion'

export async function GET() {
  try {
    const materials = await getMaterials()
    return NextResponse.json(materials)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}