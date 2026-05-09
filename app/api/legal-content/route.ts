import { NextResponse } from "next/server";
import { getTextContents, getFAQs, getGuideBlocks, getGuideItems } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  const [textContents, faqs, guideBlocks, guideItems] = await Promise.all([
    getTextContents(),
    getFAQs(),
    getGuideBlocks(),
    getGuideItems(),
  ]);
  return NextResponse.json({ textContents, faqs, guideBlocks, guideItems });
}
