import type { Metadata } from "next";
import { getMaterialById } from "@/lib/notion";
import MaterialDetailClient from "./MaterialDetailClient";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const material = await getMaterialById(id);
    const title = material.title
      ? `${material.title} | toolio`
      : "教材詳細 | toolio";
    const description = material.description
      || "こどもに日本語を教える人のための教材・ツールダウンロードサイト。授業やレッスンで使えるワークシートや教材をすぐにダウンロードして活用できます。";
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        ...(material.mockupImage ? { images: [{ url: material.mockupImage }] } : {}),
      },
    };
  } catch {
    return {
      title: "教材詳細 | toolio",
      description: "こどもに日本語を教える人のための教材・ツールダウンロードサイト。",
    };
  }
}

export default function MaterialDetailPage() {
  return <MaterialDetailClient />;
}
