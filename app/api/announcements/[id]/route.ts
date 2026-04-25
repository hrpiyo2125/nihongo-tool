import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function blocksToText(blocks: any[]): string {
  return blocks
    .map((block) => {
      const type = block.type;
      const richTexts: any[] = block[type]?.rich_text ?? [];
      const text = richTexts.map((r: any) => r.plain_text).join("");
      if (type === "heading_1") return `# ${text}`;
      if (type === "heading_2") return `## ${text}`;
      if (type === "heading_3") return `### ${text}`;
      if (type === "bulleted_list_item") return `• ${text}`;
      if (type === "numbered_list_item") return `1. ${text}`;
      return text;
    })
    .filter(Boolean)
    .join("\n");
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const [page, blocksRes] = await Promise.all([
      notion.pages.retrieve({ page_id: params.id }),
      notion.blocks.children.list({ block_id: params.id }),
    ]);

    const p = page as any;
    return NextResponse.json({
      id: p.id,
      title: p.properties["名前"]?.title?.[0]?.plain_text ?? "",
      date: p.properties["date"]?.date?.start ?? "",
      type: p.properties["type"]?.select?.name ?? "general",
      material_id: p.properties["material_id"]?.rich_text?.[0]?.plain_text ?? null,
      body: blocksToText(blocksRes.results as any[]),
    });
  } catch (e) {
    console.error("Notion error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
