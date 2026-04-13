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
      // title + description + usageBasic + usageMiddle + usageAdvanced + features をベクトル化
      const text = [
        mat.title,
        mat.description,
        mat.usageBasic,
        mat.usageMiddle,
        mat.usageAdvanced,
        mat.features,
      ].filter(Boolean).join(' ')

      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      const embedding = embeddingRes.data[0].embedding

      // upsert（既存レコードも上書き）
      await supabase.from('materials').upsert(
  { id: mat.id, embedding, content: text },
  { onConflict: 'id' }
)
      updated++
    }

    return NextResponse.json({ ok: true, updated, total: materials.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}