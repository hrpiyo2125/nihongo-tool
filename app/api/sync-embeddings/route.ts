import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { getMaterials } from '@/lib/notion'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const materials = await getMaterials()
    let updated = 0

    for (const mat of materials) {
      // すでに登録済みならスキップ
      const { data: existing } = await supabase
        .from('materials')
        .select('id')
        .eq('id', mat.id)
        .single()

      if (existing) continue

      // タイトル＋説明をベクトル化
      const text = `${mat.title} ${mat.description}`
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      const embedding = embeddingRes.data[0].embedding

      await supabase.from('materials').insert({ id: mat.id, embedding })
      updated++
    }

    return NextResponse.json({ ok: true, updated, total: materials.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}