import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Notionから教材一覧取得
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: { property: 'isPublished', checkbox: { equals: true } }
    })

    for (const page of response.results) {
      const p = page as any
      const id = page.id

      // テキスト結合
      const name = p.properties.name?.title?.[0]?.plain_text ?? ''
      const description = p.properties.description?.rich_text?.[0]?.plain_text ?? ''
      const level = p.properties.level?.select?.name ?? ''
      const ageGroup = p.properties.ageGroup?.select?.name ?? ''
      const content = p.properties.content?.multi_select?.map((s: any) => s.name).join(' ') ?? ''
      const method = p.properties.method?.multi_select?.map((s: any) => s.name).join(' ') ?? ''

      const text = `${name} ${description} ${level} ${ageGroup} ${content} ${method}`.trim()

      // OpenAIでembedding生成
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text
      })
      const embedding = embeddingRes.data[0].embedding

      // Supabaseにupsert
      await supabase.from('materials').upsert({ id, embedding })
    }

    return NextResponse.json({ success: true, count: response.results.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to sync embeddings' }, { status: 500 })
  }
}