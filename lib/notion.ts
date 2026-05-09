import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const databaseId = process.env.NOTION_DATABASE_ID!

// Notionの日本語表示名 → page.tsxで使うID に変換
const contentLabelToId: Record<string, string> = {
  'ひらがな':   'hiragana',
  'カタカナ':   'katakana',
  '漢字':       'kanji',
  '語彙':       'vocab',
  '助詞':       'joshi',
  '文型':       'bunkei',
  'あいさつ':   'aisatsu',
  '場面会話':   'kaiwa',
  '季節・行事': 'season',
  '食べ物':     'food',
  '動物':       'animal',
  '体・健康':   'body',
  '色・形':     'color',
  '数・算数':   'number',
  '形容詞':     'adjective',
  '動詞':       'verb',
  '接続詞':     'conjunction',
  '文法':       'grammar',
  '身近なもの': 'familiar',
  'ことば':     'kotoba',
  'やさい・くだもの': 'vegefruit',
  '自分のこと': 'myself',
  // 旧項目（既存データ互換用）
  '算数':       'number',
  '絵本':       'picture',
  'うた':       'song',
  '日常':       'daily',
  '季節':       'season',
  '数字':       'number',
}

const methodLabelToId: Record<string, string> = {
  'ドリル':       'drill',
  'テスト':       'test',
  'カード':       'card',
  'かるた':       'karuta',
  'ゲーム':       'game',
  'ぬりえ':       'nurie',
  '読み物':       'reading',
  'うた':         'music',
  'ロールプレイ': 'roleplay',
  'ビンゴ':       'bingo',
  'インタビュー': 'interview',
  'プレゼンテーション': 'presentation',
  '文づくり':     'sentence',
  '作文':         'essay',
  'チェック':     'check',
  'すごろく':     'sugoroku',
  'ポスター':     'poster',
  // 旧項目（既存データ互換用）
  '練習':         'drill',
  '工作':         'nurie',
  '会話':         'roleplay',
  'なぞり書き':   'drill',
  'パズル':       'game',
}

const requiredPlanLabelToId: Record<string, string> = {
  'free':         'free',
  'Free':         'free',
  '無料':         'free',
  'subscribe':    'subscribe',
  'Subscribe':    'subscribe',
  'ライト':       'subscribe',
  'スタンダード': 'subscribe',
  'プレミアム':   'subscribe',
  'paid':         'subscribe',
}
export async function getMaterials() {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'isPublished',
      checkbox: {
        equals: true,
      },
    },
  } as any)

  return response.results.map((page: any) => {
    const props = page.properties
    return {
      id: page.id,
      title: props.name?.title[0]?.plain_text ?? '',
      description: props.description?.rich_text[0]?.plain_text ?? '',
      level:        (props.level?.multi_select ?? []).map((s: any) => s.name),
      // 日本語ラベル → IDに変換（マップにない値はそのまま通す）
      content: (props.content?.multi_select ?? []).map((s: any) => contentLabelToId[s.name] ?? s.name),
      method:  (props.method?.multi_select  ?? []).map((s: any) => methodLabelToId[s.name]  ?? s.name),
      ageGroup:     props.ageGroup?.select?.name ?? '',
      requiredPlan: requiredPlanLabelToId[
      props.requiredPlan?.select?.name ?? 
      props.requiredPlan?.rich_text?.[0]?.plain_text ?? ''
      ] ?? 'free',
      pdfFile:      props.pdfFile?.files[0]?.file?.url ?? props.pdfFile?.files[0]?.external?.url ?? '',
      thumbnailUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${page.id}.png`,
      isPickup:     props.isPickup?.checkbox     ?? false,
      isRecommended: props.isRecommended?.checkbox ?? false,
      ranking:      props.ranking?.number        ?? null,
      isNew:        (() => {
        const publishedAt = props.publishedAt?.date?.start
        if (!publishedAt) return props.isNew?.checkbox ?? false
        const diff = Date.now() - new Date(publishedAt).getTime()
        return diff <= 7 * 24 * 60 * 60 * 1000
      })(),
      usageBasic:     props.usageBasic?.rich_text?.[0]?.plain_text ?? '',
      usageMiddle:    props.usageMiddle?.rich_text?.[0]?.plain_text ?? '',
      usageAdvanced:  props.usageAdvanced?.rich_text?.[0]?.plain_text ?? '',
      features:    props.features?.rich_text?.[0]?.plain_text ?? '',
      howto:       props.howto?.rich_text?.[0]?.plain_text ?? '',
      searchKeywords: props.searchKeywords?.rich_text?.[0]?.plain_text ?? '',
      studyTime:    props.studyTime?.rich_text?.[0]?.plain_text ?? '',
    }
  })
}
export async function getTextContents(): Promise<Record<string, string>> {
  const dbId = process.env.NOTION_TEXT_CONTENT_DB_ID!
  const response = await notion.databases.query({ database_id: dbId })
  const result: Record<string, string> = {}
  for (const page of response.results as any[]) {
    const title = page.properties['名前']?.title?.[0]?.plain_text ?? ''
    const body = (page.properties['本文']?.rich_text ?? []).map((r: any) => r.plain_text).join('')
    if (title) result[title] = body
  }
  return result
}

export type NotionBlock = {
  type: 'paragraph' | 'heading_2' | 'heading_3' | 'bulleted_list_item' | 'numbered_list_item' | 'image' | 'divider' | 'unknown';
  text?: string;
  imageUrl?: string;
  imageCaption?: string;
};


export async function getFAQs(): Promise<{ question: string; answer: string; category: string }[]> {
  const dbId = process.env.NOTION_FAQ_DB_ID!
  const response = await notion.databases.query({ database_id: dbId })
  return (response.results as any[]).map((page) => ({
    question: page.properties['質問']?.title?.[0]?.plain_text ?? '',
    answer: (page.properties['回答']?.rich_text ?? []).map((r: any) => r.plain_text).join(''),
    category: page.properties['カテゴリ']?.select?.name ?? '',
  })).filter((f) => f.question)
}

export async function getAnnouncements(): Promise<{ title: string; body: string }[]> {
  const dbId = process.env.NOTION_ANNOUNCEMENTS_DB_ID!
  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  } as any)
  return (response.results as any[]).map((page) => ({
    title: page.properties['名前']?.title?.[0]?.plain_text ?? page.properties['title']?.title?.[0]?.plain_text ?? '',
    body: (page.properties['本文']?.rich_text ?? page.properties['内容']?.rich_text ?? []).map((r: any) => r.plain_text).join(''),
  })).filter((a) => a.title)
}

export async function getPlans(): Promise<{ key: string; displayName: string; price: number; sortOrder: number }[]> {
  const dbId = process.env.NOTION_PLANS_DB_ID!
  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: 'sortOrder', direction: 'ascending' }],
  } as any)
  return (response.results as any[]).map((page) => ({
    key: page.properties['名前']?.title?.[0]?.plain_text ?? '',
    displayName: page.properties['displayName']?.rich_text?.[0]?.plain_text ?? '',
    price: page.properties['price']?.number ?? 0,
    sortOrder: page.properties['sortOrder']?.number ?? 0,
  })).filter((p) => p.key)
}

export async function getPlanFeatures(): Promise<{ label: string; fromPlan: string; freeNote: string; paidNote: string; sortOrder: number }[]> {
  const dbId = process.env.NOTION_PLAN_FEATURES_DB_ID!
  const response = await notion.databases.query({
    database_id: dbId,
    sorts: [{ property: 'sortOrder', direction: 'ascending' }],
  } as any)
  return (response.results as any[]).map((page) => ({
    label: page.properties['名前']?.title?.[0]?.plain_text ?? '',
    fromPlan: page.properties['fromPlan']?.select?.name ?? 'free',
    freeNote: page.properties['freeNote']?.rich_text?.[0]?.plain_text ?? '',
    paidNote: page.properties['paidNote']?.rich_text?.[0]?.plain_text ?? '',
    sortOrder: page.properties['sortOrder']?.number ?? 0,
  })).filter((f) => f.label)
}

export async function getMaterialById(id: string) {
  console.log('getMaterialById called with id:', id)
  try {
    const page = await notion.pages.retrieve({ page_id: id }) as any
    console.log('page retrieved:', page.id)
    const props = page.properties
    return {
      id: page.id,
      title:       props.name?.title[0]?.plain_text ?? '',
      description: props.description?.rich_text[0]?.plain_text ?? '',
      level:        (props.level?.multi_select ?? []).map((s: any) => s.name),
      content:     (props.content?.multi_select ?? []).map((s: any) => contentLabelToId[s.name] ?? s.name),
      method:      (props.method?.multi_select  ?? []).map((s: any) => methodLabelToId[s.name]  ?? s.name),
      ageGroup:    props.ageGroup?.select?.name ?? '',
      requiredPlan: requiredPlanLabelToId[
        props.requiredPlan?.select?.name ?? 
        props.requiredPlan?.rich_text?.[0]?.plain_text ?? ''
      ] ?? 'free',
      mockupImage: props.mockupImage?.files[0]?.file?.url ?? props.mockupImage?.files[0]?.external?.url ?? '',
      isPickup:    props.isPickup?.checkbox ?? false,
      isRecommended: props.isRecommended?.checkbox ?? false,
      ranking:     props.ranking?.number ?? null,
      isNew:       props.isNew?.checkbox ?? false,
      usageBasic:    props.usageBasic?.rich_text?.[0]?.plain_text ?? '',
      usageMiddle:   props.usageMiddle?.rich_text?.[0]?.plain_text ?? '',
      usageAdvanced: props.usageAdvanced?.rich_text?.[0]?.plain_text ?? '',
      features:    props.features?.rich_text?.[0]?.plain_text ?? '',
      howto:       props.howto?.rich_text?.[0]?.plain_text ?? '',
      studyTime:   props.studyTime?.rich_text?.[0]?.plain_text ?? '',
      searchKeywords: props.searchKeywords?.rich_text?.[0]?.plain_text ?? '',
      pdfFile: props.pdfFile?.files[0]?.file?.url ?? props.pdfFile?.files[0]?.external?.url ?? '',
    }
  } catch (e) {
    
    console.error('getMaterialById error:', e)
    throw e
  }
}