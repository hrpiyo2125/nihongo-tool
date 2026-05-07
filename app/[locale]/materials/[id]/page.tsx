import type { Metadata } from "next";
import { getMaterialById } from "@/lib/notion";
import MaterialDetailClient from "./MaterialDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nihongo-tool.com";

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
    const keywords = material.searchKeywords
      ? material.searchKeywords.split(/[,、\s]+/).filter(Boolean)
      : [];

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/materials/${id}`,
        siteName: "toolio",
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

export default async function MaterialDetailPage({ params }: Props) {
  const { id } = await params;
  let jsonLd: object | null = null;

  try {
    const material = await getMaterialById(id);
    const keywords = material.searchKeywords
      ? material.searchKeywords.split(/[,、\s]+/).filter(Boolean)
      : [];

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: material.title,
      description: material.description,
      url: `${BASE_URL}/materials/${id}`,
      keywords: keywords.join(", "),
      inLanguage: "ja",
      educationalLevel: material.ageGroup,
      isAccessibleForFree: material.requiredPlan === "free",
      provider: {
        "@type": "Organization",
        name: "toolio",
        url: BASE_URL,
      },
      ...(material.mockupImage ? { image: material.mockupImage } : {}),
    };
  } catch {
    // JSON-LDなしで表示
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MaterialDetailClient />
    </>
  );
}
