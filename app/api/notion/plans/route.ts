import { NextResponse } from "next/server";
import { getPlans, getPlanFeatures } from "@/lib/notion";

export const dynamic = 'force-dynamic';

export async function GET() {
  const [plans, features] = await Promise.all([
    getPlans(),
    getPlanFeatures(),
  ]);
  return NextResponse.json({ plans, features });
}
