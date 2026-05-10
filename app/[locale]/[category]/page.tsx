import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getMaterials } from "@/lib/notion";
import { contentTabLabels, methodTabLabels } from "@/lib/tabs";
import { siteConfig } from "@/lib/site.config";
import MobileHome from "../MobileHome";
import DesktopHome from "../DesktopHome";

const CONTENT_IDS = ["hiragana","katakana","kanji","joshi","kaiwa","season","food","animal","body","color","number","adjective","verb","conjunction","grammar","familiar","kotoba","vegefruit","myself"];
const METHOD_IDS = ["drill","test","card","nurie","roleplay","bingo","interview","presentation","sentence","essay","check","sugoroku","poster"];

function isMobileUA(ua: string) {
  return /iPhone|iPod|Android.*Mobile/i.test(ua);
}

type Props = { params: Promise<{ category: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, locale } = await params;
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;
  const label = cl[category] ?? ml[category];
  if (!label) return {};
  const title = `${label}の教材 | toolio`;
  const description = `こどもに日本語を教える${label}の教材・ワークシートを無料ダウンロード。授業やレッスンですぐに使えます。`;
  const base = siteConfig.url;
  return {
    title,
    description,
    alternates: {
      canonical: locale === 'ja' ? `${base}/${category}` : `${base}/en/${category}`,
      languages: {
        'ja': `${base}/${category}`,
        'en': `${base}/en/${category}`,
        'x-default': `${base}/${category}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const isContent = CONTENT_IDS.includes(category);
  const isMethod = METHOD_IDS.includes(category);
  if (!isContent && !isMethod) notFound();

  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isMobile = isMobileUA(ua);
  const materials = await getMaterials();

  const initialContent = isContent ? category : undefined;
  const initialMethod = isMethod ? category : undefined;

  if (isMobile) return <MobileHome materials={materials} initialContent={initialContent} initialMethod={initialMethod} />;
  return <DesktopHome materials={materials} initialContent={initialContent} initialMethod={initialMethod} />;
}
