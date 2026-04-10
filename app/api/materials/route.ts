import { NextResponse } from 'next/server'
import { getMaterialById } from '@/lib/notion'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const material = await getMaterialById(id)
    return NextResponse.json(material)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 })
  }
}