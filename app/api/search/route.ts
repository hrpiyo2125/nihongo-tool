import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function convertRomajiToJapanese(input: string): string {
  const map: Record<string, string> = {
    hiragana: 'ひらがな', katakana: 'カタカナ', kanji: '漢字',
    vocab: '語彙', vocabulary: '語彙', particle: '助詞', particles: '助詞',
    grammar: '文型', greeting: 'あいさつ', greetings: 'あいさつ',
    conversation: '会話', season: '季節', food: '食べ物',
    animal: '動物', body: '体', color: '色', number: '数',
    drill: 'ドリル', test: 'テスト', card: 'カード',
    karuta: 'かるた', game: 'ゲーム', coloring: 'ぬりえ',
    reading: '読み物', song: 'うた', roleplay: 'ロールプレイ',
    basic: 'ベーシック', middle: 'ミドル', advanced: 'アドバンスド',
    free: '無料',
  }
  const lower = input.toLowerCase().trim()
  return map[lower] ?? input
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    if (!query) return NextResponse.json({ results: [] })

    const convertedQuery = convertRomajiToJapanese(query)

    // クエリをベクトル化
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: convertedQuery,
    })
    const embedding = embeddingRes.data[0].embedding

    // ハイブリッド検索（ベクトル＋テキスト）
    const { data, error } = await supabase.rpc('match_materials', {
      query_embedding: embedding,
      query_text: convertedQuery,
      match_threshold: 0.1,
      match_count: 20,
    })

    if (error) throw error

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export {}