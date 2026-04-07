import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const dbId = process.env.NOTION_ANNOUNCEMENTS_DB_ID!;

export async function GET() {
  console.log("DB ID:", dbId);
  console.log("API KEY:", process.env.NOTION_API_KEY ? "exists" : "missing");
  try {
    const res = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "published",
        checkbox: { equals: true },
      },
      sorts: [{ property: "date", direction: "descending" }],
    });

    console.log("Results count:", res.results.length);

    const announcements = res.results.map((page: any) => ({
      id: page.id,
      title: page.properties["名前"]?.title?.[0]?.plain_text ?? "",
      date: page.properties["date"]?.date?.start ?? "",
    }));

    return NextResponse.json(announcements);
  } catch (e) {
    console.error("Notion error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}