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
  // 旧項目（既存データ互換用）
  '算数':       'number',
  '文法':       'grammar',
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
  // 旧項目（既存データ互換用）
  '練習':         'drill',
  '工作':         'nurie',
  '会話':         'roleplay',
  'なぞり書き':   'drill',
  'パズル':       'game',
}

const requiredPlanLabelToId: Record<string, string> = {
  '無料':         'free',
  'ライト':       'light',
  'スタンダード': 'standard',
  'プレミアム':   'premium',
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
      thumbnail:    props.thumbnail?.files[0]?.file?.url ?? props.thumbnail?.files[0]?.external?.url ?? '',
      isPickup:     props.isPickup?.checkbox     ?? false,
      isRecommended: props.isRecommended?.checkbox ?? false,
      ranking:      props.ranking?.number        ?? null,
      isNew:        props.isNew?.checkbox        ?? false,
      usageBasic:     props.usageBasic?.rich_text?.[0]?.plain_text ?? '',
      usageMiddle:    props.usageMiddle?.rich_text?.[0]?.plain_text ?? '',
      usageAdvanced:  props.usageAdvanced?.rich_text?.[0]?.plain_text ?? '',
      features:    props.features?.rich_text?.[0]?.plain_text ?? '',
      howto:       props.howto?.rich_text?.[0]?.plain_text ?? '',
    }
  })
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
      thumbnail:   props.thumbnail?.files[0]?.file?.url ?? props.thumbnail?.files[0]?.external?.url ?? '',
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
      pdfFile: props.pdfFIle?.files[0]?.file?.url ?? props.pdfFIle?.files[0]?.external?.url ?? '',
    }
  } catch (e) {
    
    console.error('getMaterialById error:', e)
    throw e
  }
}