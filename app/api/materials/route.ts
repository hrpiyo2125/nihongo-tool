import { NextResponse } from 'next/server'
import { getMaterialsWithPageCount } from '@/lib/materials'

export async function GET() {
  try {
    const materials = await getMaterialsWithPageCount()
    return NextResponse.json(materials)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 })
  }
}
