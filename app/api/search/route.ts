import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    if (!query) return NextResponse.json({ results: [] })

    // クエリをベクトル化
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })
    const embedding = embeddingRes.data[0].embedding

    // Supabaseでベクトル検索
    const { data, error } = await supabase.rpc('match_materials', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 20
    })

    if (error) throw error

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
export {}