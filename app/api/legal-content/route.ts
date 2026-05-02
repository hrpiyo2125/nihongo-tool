import { NextResponse } from "next/server";
import { getTextContents, getFAQs } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  const [textContents, faqs] = await Promise.all([
    getTextContents(),
    getFAQs(),
  ]);
  return NextResponse.json({ textContents, faqs });
}
