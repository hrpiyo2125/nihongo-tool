import { NextResponse } from 'next/server'
import { getMaterialById } from '@/lib/notion'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const material = await getMaterialById(params.id)
    return NextResponse.json(material)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 })
  }
}