"use client";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { useState, useEffect, useRef } from "react";

function PdfCardThumb({ pdfUrl, bg, char, charColor }: { pdfUrl?: string; bg: string; char: string; charColor: string }) {
  const [pdfPage, setPdfPage] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!pdfUrl) return;
    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const doc = await pdfjsLib.getDocument({ url: `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`, withCredentials: false }).promise;
        setPdfPage(await doc.getPage(1));
      } catch (e) { console.error("PDF thumb error:", e); }
    })();
  }, [pdfUrl]);
  useEffect(() => {
    if (!pdfPage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const viewport = pdfPage.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    (pdfPage.render as any)({ canvasContext: canvas.getContext("2d")!, viewport, canvas });
  }, [pdfPage]);
  return (
    <div style={{ height: 135, background: bg, position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: charColor, fontWeight: 700 }}>{char}</span>
      {pdfPage && <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "auto", display: "block" }} />}
    </div>
  );
}
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import ToolioConceptSection from "./ToolioConceptSection"
import TeaserModal from "./TeaserModal"
import MaterialCard from "./MaterialCard"
import { contentTabLabels, methodTabLabels, getContentTabs, getMethodTabs } from "../../lib/tabs";
import { getCardStyle, planRank, canDownload } from "../../lib/materialUtils";
import { useIsMobile } from "./useIsMobile";
import MobileHome from "./MobileHome";
import { TroubleSection, GuideSection } from "./TroubleGuide";
import MyPage from "./MyPage";
import { BrandIcon } from "../../components/BrandIcon";
import PersonalizedSection from "./PersonalizedSection";



const scrollbarStyle = `
  .toolio-scroll-y::-webkit-scrollbar { width: 5px; }
  .toolio-scroll-y::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 4px; }
  .toolio-scroll-y::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 4px; }
  .toolio-scroll-y::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
  .toolio-scroll-x::-webkit-scrollbar { height: 5px; }
  .toolio-scroll-x::-webkit-scrollbar-track { background: rgba(0,0,0,0.04); border-radius: 4px; }
  .toolio-scroll-x::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 4px; }
  .toolio-scroll-x::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.28); }
`;


type Material = {
  id: string;
  title: string;
  description: string;
  level: string[];
  content: string[];
  method: string[];
  ageGroup: string;
  requiredPlan: string;
  thumbnail: string;
  pdfFile?: string;
  isPickup: boolean;
  isRecommended: boolean;
  ranking: number | null;
  isNew: boolean;
  bg?: string;
  char?: string;
  charColor?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
};



const cards = [
  { img: "あ", bg: "linear-gradient(135deg,#dbe8ff,#c8d8ff)", color: "#4a72c4", tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "ひらがな練習シート", sub: "50音すべて収録・なぞり書き対応" },
  { img: "🃏", bg: "linear-gradient(135deg,#ecdeff,#ddc8ff)", color: "#8a5cc4", tag: "PICK", tagBg: "#ecdeff", tagColor: "#7040b0", title: "かるたセット・春", sub: "春の語彙を楽しく覚えられる" },
  { img: "字", bg: "linear-gradient(135deg,#ffd9ee,#ffc8e4)", color: "#c44a88", tag: "NEW", tagBg: "#ffd9ee", tagColor: "#a03070", title: "漢字テスト1年生", sub: "小1の漢字80字をテスト形式で" },
  { img: "🎮", bg: "linear-gradient(135deg,#d6f5e5,#c0ecd4)", color: "#3a8a5a", tag: "無料", tagBg: "#d6f5e5", tagColor: "#2a6a44", title: "かずあそびゲーム", sub: "数字と量の対応を遊びながら学ぶ" },
];

const guideTabs = [
  { id: "start",  label: "はじめての方へ",       emoji: "✦" },
  { id: "find",   label: "教材の探し方",           emoji: "🔍" },
  { id: "more",   label: "もっと活用したい",       emoji: "★" },
  { id: "help",   label: "使っていてわからないとき", emoji: "❓" },
];

const guideStartSteps = [
  { num: "01", title: "無料アカウントを作成する", desc: "メールアドレスだけで登録できます。30秒で完了します。", sub: "登録しなくても一部の教材は閲覧できますが、ダウンロードにはアカウントが必要です。" },
  { num: "02", title: "教材一覧を開く", desc: "トップページの「教材一覧を見る」から、全教材をカテゴリ・方法別に絞り込んで探せます。" },
  { num: "03", title: "気になる教材を選ぶ", desc: "教材をクリックするとプレビューと使い方が確認できます。まずは「無料」タグの教材からお試しください。" },
  { num: "04", title: "ダウンロード・印刷する", desc: "PDFをダウンロードして、A4用紙に印刷するだけ。カラーでも白黒でも使えます。" },
];
const guideStartTips = [
  { emoji: "💡", title: "最初におすすめの教材は？", desc: "「ひらがな練習シート」や「ひらがなかるた」は初めての方に人気です。まずここから試してみてください。" },
  { emoji: "🖨", title: "印刷環境がなくても大丈夫？", desc: "コンビニのネットプリントでも印刷できます。PDFをそのまま持ち込むか、USBに入れてご利用ください。" },
];
const guideChooseCards = [
  { emoji: "🎯", title: "目的から選ぶ", items: ["文字を覚えさせたい → ひらがな・カタカナ練習シート・なぞり書き", "楽しく学ばせたい → かるた・ゲーム・パズル", "定着を確認したい → テスト・ドリル系", "季節行事に合わせたい → 季節カテゴリの教材"] },
  { emoji: "📊", title: "レベルから選ぶ", items: ["文字をまだ知らない → なぞり書き・絵カード系からスタート", "少し読める → かるた・読み物・絵本系", "ある程度読める → テスト・漢字・文法系", "日常会話ができる → 語彙・会話カード系"] },
  { emoji: "🗓", title: "時間・場面から選ぶ", items: ["授業の最初の5分 → ゲーム・かるた（短時間で盛り上がる）", "宿題として → 練習シート・テスト系", "家族で楽しく → かるた・絵本・うた系", "すきま時間に → カード系・パズル"] },
];
const guideChooseTips = [
  { emoji: "🔍", title: "迷ったときは「内容×方法」で絞り込む", desc: "教材一覧では「ひらがな × かるた」のように2軸で絞り込めます。" },
  { emoji: "❤️", title: "お気に入りに保存しておく", desc: "「使いたいかも」と思った教材はハートボタンでお気に入りに保存できます（要ログイン）。" },
];
const guideUseCards = [
  { emoji: "👩‍🏫", title: "先生の方へ", items: ["授業の導入にかるたやゲームを取り入れると子どもが集中しやすくなります", "練習シートは宿題として配布するのに最適です", "テスト系教材は単元の終わりの確認に活用できます", "「使い方ガイド」が各教材についているので、準備に迷いません"] },
  { emoji: "👨‍👩‍👧", title: "保護者の方へ", items: ["週1〜2回、10〜15分の短い時間から始めるのがおすすめです", "かるたやゲームは親子で一緒に楽しめます", "なぞり書きシートは毎日の習慣づけに使いやすいです", "お子さんが好きな学習方法（ゲーム・ぬりえなど）から始めると続きやすいです"] },
];
const guideUseTips = [
  { emoji: "🎮", title: "「楽しい」が一番の近道", desc: "かるた・ゲーム・うたなど楽しめる教材を混ぜることで、子どもが日本語を「好き」になるきっかけを作れます。" },
  { emoji: "📅", title: "週のルーティンに組み込む", desc: "「月曜は練習シート、金曜はかるた」のように曜日で種類を変えると飽きにくく継続しやすくなります。" },
];
const guideMoreTips = [
  { emoji: "📂", title: "ダウンロード履歴を活用する", desc: "過去にダウンロードした教材はマイページの履歴からすぐ再ダウンロードできます。" },
  { emoji: "❤️", title: "お気に入りリストを整理する", desc: "学習テーマや季節ごとにお気に入りをまとめておくと、授業・学習の計画が立てやすくなります。" },
  { emoji: "🔓", title: "サブスクプランで全教材を使い放題に", desc: "サブスクプランに登録すると体系的なカリキュラム・全教材が使い放題になります。" },
  { emoji: "📬", title: "新着教材をチェックする", desc: "トップページの「新着」タブで最新の教材を確認できます。定期的に新しい教材が追加されます。" },
];

function GuideTipItem({ tip }: { tip: { emoji: string; title: string; desc: string } }) {
  return (
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 14, padding: "18px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><span>{tip.emoji}</span>{tip.title}</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{tip.desc}</div>
    </div>
  );
}

function GuideCardItem({ card }: { card: { emoji: string; title: string; items: string[] } }) {
  return (
    <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}><span>{card.emoji}</span>{card.title}</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {card.items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
const troubleTabs = [
  { id: "start",      label: "何から始める？" },
  { id: "level",      label: "レベルがわからない" },
  { id: "goal",       label: "何を目標にすればいい？" },
  { id: "material",   label: "どの教材を使えばいい？" },
  { id: "teach",      label: "どう教えればいい？" },
  { id: "motivation", label: "やる気を出さない" },
  { id: "bored",      label: "子どもが飽きてしまう" },
  { id: "improve",    label: "できるようにならない" },
];


const ACTIVE_COLOR = "#7a50b0";

type NavItem = {
  id: string;
  label: string;
  icon: (id: string, active: boolean) => React.ReactNode;
  badge?: number;
};


type ItemType = { 
  label: string; 
  char: string; 
  color: string; 
  imageSrc?: string | null;  // nullを追加
  isMore?: boolean; 
  contentId?: string; 
  methodId?: string; 
};

function IconItem({ item, onClick }: { item: ItemType; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0, width: 76 }}>
      <div style={{ width: 62, height: 62, borderRadius: "50%", background: item.isMore ? "white" : item.color, border: item.isMore ? "1.5px dashed #c9a0f0" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: item.isMore ? 20 : item.char.length > 1 ? 15 : 22, fontWeight: 700, color: item.isMore ? "#b090d0" : "#555", flexShrink: 0 }}>
        {item.imageSrc ? <img src={item.imageSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : item.char}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#777", textAlign: "center", lineHeight: 1.3, width: "100%" }}>{item.label}</span>
    </div>
  );
}





// ===== 教材一覧モーダル =====
function MaterialsModal({
  initContent, initMethod, onClose, isLoggedIn, materials, tmm, contentTabs, methodTabs, locale, userPlan,
}: {
  initContent: string; 
  initMethod: string; 
  onClose: () => void; 
  isLoggedIn: boolean; 
  materials: Material[]; 
  tmm: (key: string) => string; 
  contentTabs: {id: string; label: string; char: string; color: string; imageSrc: string | null}[]; 
  methodTabs: {id: string; label: string; char: string; imageSrc: string | null}[];
  locale: string;
  userPlan: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}) {
  const [activeContent, setActiveContent] = useState(initContent);
  const [activeMethod, setActiveMethod] = useState(initMethod);
  const [teaserMat, setTeaserMat] = useState<Material | null>(null);
  const [favIds, setFavIds] = useState<string[]>([]);
  const [teaserFavTooltip, setTeaserFavTooltip] = useState(false);
  const [teaserDownTooltip, setTeaserDownTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (data) setFavIds(data.map((d: { material_id: string }) => d.material_id));
    });
  }, [isLoggedIn]);

  const filtered = materials.filter((m) => {
  if (searchResults !== null) return searchResults.includes(m.id);
  const cMatch = activeContent === "all" || (m.content ?? []).includes(activeContent);
  const mMatch = activeMethod === "all" || (m.method ?? []).includes(activeMethod);
  return cMatch && mMatch;
});

  const handleMethodTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY + e.deltaX;
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <style>{scrollbarStyle}</style>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, zIndex: 110, width: 40, height: 40, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", fontSize: 18, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>✕</button>

      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", width: "91vw", maxWidth: 1600, height: "calc(100vh - 56px)", background: "white", borderRadius: 16, boxShadow: "0 8px 48px rgba(0,0,0,0.22)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "24px 28px 20px 28px", borderBottom: "0.5px solid rgba(0,0,0,0.06)", flexShrink: 0, gap: 28 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase", marginBottom: 2 }}>Materials</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#999", whiteSpace: "nowrap" }}>{tmm("title")}</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#f8f6ff", border: "1px solid rgba(163,192,255,0.4)", borderRadius: 28, padding: "12px 24px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
               type="text"
               placeholder={tmm("search_placeholder")}
               value={searchQuery}
               onChange={async (e) => {
                  const q = e.target.value;
                  setSearchQuery(q);
                  if (!q.trim()) { setSearchResults(null); return; }
                  setSearchLoading(true);
                  try {
                  const res = await fetch("/api/search", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query: q }),
                      });
                  const data = await res.json();
                      setSearchResults((data.results ?? []).map((r: { id: string }) => r.id));
                      } catch { setSearchResults(null); }
                      finally { setSearchLoading(false); }
                      }}
                  style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, color: "#555", outline: "none" }}
             />
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="toolio-scroll-y" style={{ width: 180, flexShrink: 0, overflowY: "auto", padding: "16px 0 28px", borderRight: "0.5px solid rgba(0,0,0,0.06)" }}>
            {contentTabs.map((tab) => {
              const active = activeContent === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveContent(tab.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", margin: "0 8px", background: active ? "rgba(163,192,255,0.15)" : "transparent", border: "none", borderRadius: 10, cursor: "pointer", width: "calc(100% - 16px)", textAlign: "left" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: tab.id === "all" ? "linear-gradient(135deg,#f4b9b9,#a3c0ff)" : tab.color, border: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 13, fontWeight: 700, color: "#555" }}>
                    {tab.imageSrc ? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : tab.char}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#666", whiteSpace: "nowrap" }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 28px 0", background: "white", flexShrink: 0 }}>
              <div className="toolio-scroll-x" style={{ display: "flex", gap: 6, overflowX: "scroll", paddingBottom: 6 }} onWheel={handleMethodTabWheel}>
                {methodTabs.map((tab) => {
                 const active = activeMethod === tab.id;
                 return (<button key={tab.id} onClick={() => setActiveMethod(tab.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 5px", flexShrink: 0, background: active ? "rgba(163,192,255,0.18)" : "rgba(0,0,0,0.03)", border: active ? "1px solid rgba(163,192,255,0.5)" : "1px solid rgba(0,0,0,0.07)", borderRadius: 20, cursor: "pointer" }}>
                 <div style={{ width: 24, height: 24, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                  {tab.imageSrc? <img src={tab.imageSrc} alt={tab.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                   : <span>{tab.char}</span>
                  }
                 </div>
                 <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#888", whiteSpace: "nowrap" }}>{tab.label}</span>
                 </button>
                 );
                 })}
              </div>
              <div style={{ padding: "10px 0 14px", fontSize: 12, color: "#bbb" }}>
                {contentTabs.find(t => t.id === activeContent)?.label}
                {activeMethod !== "all" && ` × ${methodTabs.find(t => t.id === activeMethod)?.label}`}
                {` — ${filtered.length}件`}
              </div>
            </div>

            <div className="toolio-scroll-y" style={{ flex: 1, overflowY: "auto", padding: "4px 24px 40px" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 15 }}>該当する教材がありません</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {filtered.map((mat) => {
                    const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
                    return (
                      <div key={mat.id} onClick={() => setTeaserMat(mat)} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white", cursor: "pointer", position: "relative" }}>

                        {/* ✅ 教材カード右上：ログイン時のみハートを表示、未ログイン時は何も表示しない */}
                        {isLoggedIn && (
                          <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const supabase = createClient();
                                const { data: { session } } = await supabase.auth.getSession();
                                if (!session) return;
                                if (favIds.includes(mat.id)) {
                                  await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                                  setFavIds((prev) => prev.filter((id) => id !== mat.id));
                                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
                                } else {
                                  await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                                  setFavIds((prev) => [...prev, mat.id]);
                                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
                                }
                              }}
                              style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "0.5px solid rgba(200,180,230,0.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill={favIds.includes(mat.id) ? "#c9a0f0" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#c9a0f0"/>
                              </svg>
                            </button>
                          </div>
                        )}

                        <PdfCardThumb pdfUrl={mat.pdfFile} bg={bg} char={char} charColor={charColor} />
                        <div style={{ padding: "10px 12px 14px" }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: tagBg, color: tagColor, display: "inline-block", marginBottom: 6 }}>{tag}</span>
                          {(mat.level ?? []).length > 0 && (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                              {(mat.level ?? []).map((lv: string) => (
                                <span key={lv} style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: lv === "Basic" ? "#d6f5e5" : lv === "Middle" ? "#e8efff" : "#ffe8f4", color: lv === "Basic" ? "#2a6a44" : lv === "Middle" ? "#3a5a9a" : "#a03070" }}>{lv}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.4 }}>{mat.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ティザーモーダル */}
      {teaserMat && (() => {
        const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(teaserMat, locale);
        return (
          <TeaserModal
            mat={teaserMat}
            bg={bg} char={char} charColor={charColor}
            tag={tag} tagBg={tagBg} tagColor={tagColor}
            isLoggedIn={isLoggedIn}
            userPlan={userPlan}
            favIds={favIds}
            contentTabs={contentTabs}
            methodTabs={methodTabs}
            locale={locale}
            tmm={tmm}
            onClose={() => setTeaserMat(null)}
            onFavChange={(materialId, isFav) => {
              if (isFav) setFavIds(prev => [...prev, materialId]);
              else setFavIds(prev => prev.filter(id => id !== materialId));
            }}
          />
        );
      })()}
    </div>
  );
}


function UserMenuPopup({
  userIconRef, userInitial, avatarUrl, userName, onClose, onNavigate, onRouterPush, onLogout, sbOpen, userPlan, cancelAtPeriodEnd, currentPeriodEnd, tm,
}: {
  userIconRef: React.RefObject<HTMLDivElement | null>;
  sbOpen: boolean;
  userInitial: string;
  avatarUrl?: string | null;
  userName: string;
  userPlan: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onRouterPush: (href: string) => void;
  onLogout: () => void;
  tm: (key: string) => string;
}) {
  const el = userIconRef.current;if (!el) return null;
  const rect = el.getBoundingClientRect();if (!rect) return null;
  const left = sbOpen ? 308 : 80;

  return (
    <div style={{
      position: "fixed",
      left: sbOpen ? 200 : 80,
      bottom: window.innerHeight - rect.bottom - 8,
      width: 240,
      background: "white",
      borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      border: "0.5px solid rgba(200,170,240,0.25)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      <div style={{ padding: "16px 18px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
          {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{userName}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>
  {userPlan === "light" ? "ライトプラン" : userPlan === "standard" ? "スタンダードプラン" : userPlan === "premium" ? "プレミアムプラン" : tm("free_plan")}
  {cancelAtPeriodEnd && currentPeriodEnd && (
    <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>
      {new Date(currentPeriodEnd).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能
    </span>
  )}
</div>
        </div>
      </div>
      {[
        { icon: "user" as const, label: tm("profile"), page: "settings-profile" },
        { icon: "plan" as const, label: tm("plan"), page: "plan" },
        { icon: "star" as const, label: tm("points"), page: "pt" },
        { icon: "billing" as const, label: tm("billing"), page: "settings-billing" },
        { icon: "bell" as const, label: tm("notifications"), page: "settings-notifications" },
      ].map((item) => (
        <button key={item.label} onClick={() => {
         onNavigate(item.page);
         }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
          <BrandIcon name={item.icon} size={17} color="#c9a0f0" />{item.label}
        </button>
      ))}
      <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#e49bfd" }}>
        <BrandIcon name="logout" size={17} color="#e49bfd" />{tm("logout")}
      </button>
    </div>
  );
}

function GuestLoginPopup({
  userIconRef, onClose, onRouterPush, sbOpen,
}: {
  userIconRef: React.RefObject<HTMLDivElement | null>;
  sbOpen: boolean;
  onClose: () => void;
  onRouterPush: (href: string) => void;
}) {
  const el = userIconRef.current; if (!el) return null;
  const rect = el.getBoundingClientRect(); if (!rect) return null;
  return (
    <div style={{
      position: "fixed",
      left: sbOpen ? 200 : 80,
      bottom: window.innerHeight - rect.bottom - 8,
      width: 240,
      background: "white",
      borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
      border: "0.5px solid rgba(200,170,240,0.25)",
      zIndex: 50,
      overflow: "hidden",
    }}>
      <div style={{ padding: "14px 18px 10px", borderBottom: "0.5px solid rgba(200,170,240,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>ログインしますか？</div>
      </div>
      <button onClick={() => { onClose(); onRouterPush("/auth?mode=login"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#444", borderBottom: "0.5px solid rgba(200,170,240,0.1)" }}>
        <BrandIcon name="key" size={17} color="#c9a0f0" />ログイン
      </button>
      <button onClick={() => { onClose(); onRouterPush("/auth"); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" as const, fontSize: 13, color: "#7040b0" }}>
        <BrandIcon name="sparkle" size={17} color="#9b6ed4" />会員でない方はこちらから新規登録
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const th = useTranslations('home');
  const tm = useTranslations('mypage');
const tmm = useTranslations('materials_modal');
const pathname = usePathname();

const switchLanguage = () => {
  const nextLocale = locale === 'ja' ? 'en' : 'ja';
  const newPath = pathname.replace(`/${locale}`, '') || '/';
  router.push(`/${nextLocale}${newPath}`);
};
const navItems: NavItem[] = [
  { id: "home", label: t("home"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9 22V12h6v10" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "materials", label: t("materials"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="3" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="3" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /><rect x="14" y="14" width="7" height="7" rx="1" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "dl", label: t("dl"), badge: 3, icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M7 11l5 5 5-5" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M4 20h16" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "purchases", label: t("purchases"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M2 10h20" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M6 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M14 15h4" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "fav", label: t("fav"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "trouble", label: t("trouble"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={active ? ACTIVE_COLOR : "#bbb"} /></svg>) },
  { id: "guide", label: t("guide"), icon: (_id, active) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke={active ? ACTIVE_COLOR : "#bbb"} /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={active ? ACTIVE_COLOR : "#bbb"} /><circle cx="12" cy="17" r="0.8" fill={active ? ACTIVE_COLOR : "#bbb"} strokeWidth="0" /></svg>) },
];
  const cl = contentTabLabels[locale] ?? contentTabLabels.ja;
  const ml = methodTabLabels[locale] ?? methodTabLabels.ja;

  const contentTabs = [
  { id: "all",      label: cl.all,      char: "✦", color: "#e8efff", imageSrc: "/all.png" },
  { id: "hiragana", label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png" },
  { id: "katakana", label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png" },
  { id: "kanji",    label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png" },
  { id: "joshi",      label: cl.joshi,      char: "は", color: "#fff0ec", imageSrc: "/joshi.png" },
  { id: "kaiwa",      label: cl.kaiwa,      char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png" },
  { id: "season",     label: cl.season,     char: "季", color: "#e8efff", imageSrc: "/season.png" },
  { id: "food",       label: cl.food,       char: "🍎", color: "#fff0e8", imageSrc: "/food.png" },
  { id: "animal",     label: cl.animal,     char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png" },
  { id: "body",       label: cl.body,       char: "💪", color: "#ffe8f4", imageSrc: "/body.png" },
  { id: "color",      label: cl.color,      char: "🔵", color: "#f0e8ff", imageSrc: "/color.png" },
  { id: "number",     label: cl.number,     char: "数", color: "#e8f8ff", imageSrc: "/number.png" },
  { id: "adjective",  label: cl.adjective,  char: "い", color: "#fff8e0", imageSrc: null },
  { id: "verb",       label: cl.verb,       char: "動", color: "#e8f8ee", imageSrc: null },
  { id: "conjunction",label: cl.conjunction,char: "接", color: "#f0e8ff", imageSrc: null },
  { id: "grammar",    label: cl.grammar,    char: "文", color: "#f0ffe8", imageSrc: null },
  { id: "familiar",   label: cl.familiar,   char: "🏠", color: "#e8efff", imageSrc: null },
  { id: "kotoba",     label: cl.kotoba,     char: "語", color: "#fff0e8", imageSrc: null },
  { id: "vegefruit",  label: cl.vegefruit,  char: "🥦", color: "#e8f8ee", imageSrc: null },
];

const methodTabs: { id: string; label: string; char: string; imageSrc: string | null }[] = [
  { id: "all",      label: ml.all,      char: "✦", imageSrc: "/all.png" },
  { id: "drill",    label: ml.drill,    char: "✏", imageSrc: "/method_drill.png" },
  { id: "test",     label: ml.test,     char: "✓", imageSrc: "/method_test.png" },
  { id: "card",     label: ml.card,     char: "🃏", imageSrc: "/method_card.png" },
  { id: "nurie",     label: ml.nurie,     char: "◎", imageSrc: null },
  { id: "roleplay",  label: ml.roleplay,  char: "🎭", imageSrc: "/method_roleplay.png" },
  { id: "bingo",     label: ml.bingo,     char: "🎯", imageSrc: null },
  { id: "interview", label: ml.interview, char: "🎤", imageSrc: null },
  { id: "sentence",  label: ml.sentence,  char: "文", imageSrc: null },
  { id: "essay",     label: ml.essay,     char: "✍", imageSrc: null },
  { id: "check",     label: ml.check,     char: "✓", imageSrc: null },
  { id: "sugoroku",  label: ml.sugoroku,  char: "🎲", imageSrc: null },
  { id: "poster",    label: ml.poster,    char: "📄", imageSrc: null },
];

  const contentItems = [
  { label: cl.hiragana, char: "あ", color: "#e8efff", imageSrc: "/hiragana.png", contentId: "hiragana" },
  { label: cl.katakana, char: "ア", color: "#f0e8ff", imageSrc: "/katakana.png", contentId: "katakana" },
  { label: cl.kanji,    char: "字", color: "#ffe8f4", imageSrc: "/kanji.png",    contentId: "kanji" },
  { label: cl.joshi,      char: "は", color: "#fff0ec", imageSrc: "/joshi.png",    contentId: "joshi" },
  { label: cl.kaiwa,      char: "話", color: "#f8e8ff", imageSrc: "/kaiwa.png",    contentId: "kaiwa" },
  { label: cl.season,     char: "季", color: "#e8efff", imageSrc: "/season.png",   contentId: "season" },
  { label: cl.food,       char: "🍎", color: "#fff0e8", imageSrc: "/food.png",     contentId: "food" },
  { label: cl.animal,     char: "🐾", color: "#e8f8ee", imageSrc: "/animal.png",   contentId: "animal" },
  { label: cl.body,       char: "💪", color: "#ffe8f4", imageSrc: "/body.png",     contentId: "body" },
  { label: cl.color,      char: "🔵", color: "#f0e8ff", imageSrc: "/color.png",    contentId: "color" },
  { label: cl.number,     char: "数", color: "#e8f8ff", imageSrc: "/number.png",   contentId: "number" },
  { label: cl.adjective,  char: "い", color: "#fff8e0", imageSrc: null,            contentId: "adjective" },
  { label: cl.verb,       char: "動", color: "#e8f8ee", imageSrc: null,            contentId: "verb" },
  { label: cl.conjunction,char: "接", color: "#f0e8ff", imageSrc: null,            contentId: "conjunction" },
  { label: cl.grammar,    char: "文", color: "#f0ffe8", imageSrc: null,            contentId: "grammar" },
  { label: cl.familiar,   char: "🏠", color: "#e8efff", imageSrc: null,            contentId: "familiar" },
  { label: cl.kotoba,     char: "語", color: "#fff0e8", imageSrc: null,            contentId: "kotoba" },
  { label: cl.vegefruit,  char: "🥦", color: "#e8f8ee", imageSrc: null,            contentId: "vegefruit" },
  { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, contentId: "all" },
];

const methodItems = [
  { label: ml.drill,    char: "✏", color: "#e8efff", imageSrc: "/method_drill.png",   methodId: "drill" },
  { label: ml.test,     char: "✓", color: "#f0e8ff", imageSrc: "/method_test.png",    methodId: "test" },
  { label: ml.card,     char: "🃏", color: "#ffe8f4", imageSrc: "/method_card.png",    methodId: "card" },
  { label: ml.nurie,     char: "◎", color: "#fff0ec", imageSrc: null,                   methodId: "nurie" },
  { label: ml.roleplay,  char: "🎭", color: "#f8e8ff", imageSrc: "/method_roleplay.png", methodId: "roleplay" },
  { label: ml.bingo,     char: "🎯", color: "#e8efff", imageSrc: null,                   methodId: "bingo" },
  { label: ml.interview, char: "🎤", color: "#fff8e0", imageSrc: null,                   methodId: "interview" },
  { label: ml.sentence,  char: "文", color: "#f0ffe8", imageSrc: null,                   methodId: "sentence" },
  { label: ml.essay,     char: "✍", color: "#fff0ec", imageSrc: null,                   methodId: "essay" },
  { label: ml.check,     char: "✓", color: "#e8f8ee", imageSrc: null,                   methodId: "check" },
  { label: ml.sugoroku,  char: "🎲", color: "#f0e8ff", imageSrc: null,                   methodId: "sugoroku" },
  { label: ml.poster,    char: "📄", color: "#e8f8ff", imageSrc: null,                   methodId: "poster" },
  { label: locale === "ja" ? "もっと見る" : "More", char: "›", color: "#f8f4ff", isMore: true, methodId: "all" },
];

  const [sbOpen, setSbOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [activeTab, setActiveTab] = useState("pickup");
  const [modal, setModal] = useState<{ content: string; method: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("？");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("ゲスト");
  const [userEmail, setUserEmail] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; date: string }[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [topTeaserMat, setTopTeaserMat] = useState<Material | null>(null);
  const [topTeaserFavTooltip, setTopTeaserFavTooltip] = useState(false);
  const [topFavIds, setTopFavIds] = useState<string[]>([]);
  const [topDlIds, setTopDlIds] = useState<string[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Record<string, any>>({ full_name: "", country: "", city: "", purpose: [], occupation: "", student_level: "", occupation_other: "", purpose_other: "", notif_new_material: true, notif_favorite: false, notif_billing: true, notif_announcement: false });
  const effectiveFavIds = (!profile.plan || profile.plan === "free") ? topFavIds.slice(0, 5) : topFavIds;
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const userIconRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();


  useEffect(() => {
    fetch("/api/materials")
      .then((res) => res.json())
      .then((data) => { setMaterials(Array.isArray(data) ? data : []); setMaterialsLoading(false); })
      .catch(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
  fetch("/api/announcements")
    .then((res) => res.json())
    .then((data) => setAnnouncements(Array.isArray(data) ? data : []));
}, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { page } = (e as CustomEvent).detail;
      setActivePage(page);
      const c = document.getElementById("main-scroll");
      if (c) c.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("toolio:navigate-mypage", handler);
    return () => window.removeEventListener("toolio:navigate-mypage", handler);
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (profileData?.status === "deleted") {
      window.location.href = `/${locale}/welcome-back`;
      return;
    }
    // pending_deletion は期間満了まで通常利用継続
    if (!profileData) {
      await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || "",
        status: "active",
      });
    }
    const data = profileData ?? { id: session.user.id };
    setProfile({
      full_name: data.full_name || "",
      country: data.country || "",
      city: data.city || "",
      purpose: data.purpose || [],
      occupation: data.occupation || "",
      student_level: data.student_level || "",
      occupation_other: data.occupation_other || "",
      purpose_other: data.purpose_other || "",
      notif_new_material: data.notif_new_material ?? true,
      notif_favorite: data.notif_favorite ?? false,
      notif_billing: data.notif_billing ?? true,
      notif_announcement: data.notif_announcement ?? false,
      plan: data.plan || "free",
      plan_status: data.plan_status || "active",
      cancel_at_period_end: data.cancel_at_period_end ?? false,
      current_period_end: data.current_period_end || null,
      trial_end: data.trial_end || null,
      status: data.status || "active",
    });
    if (data.full_name) {
      setUserName(data.full_name);
      setUserInitial(data.full_name.charAt(0).toUpperCase());
    }
    if (data.avatar_url) setAvatarUrl(data.avatar_url);
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      if (session) {
      const { data: favData } = await supabase.from("favorites").select("material_id").eq("user_id", session.user.id);
      if (favData) setTopFavIds(favData.map((d: { material_id: string }) => d.material_id));
      const { data: dlData } = await supabase.from("download_history").select("material_id").eq("user_id", session.user.id);
      if (dlData) setTopDlIds([...new Set(dlData.map((d: { material_id: string }) => d.material_id))]);
      }
      if (session) {
      const { data: purchaseData } = await supabase.from("purchases").select("material_id").eq("user_id", session.user.id);
      if (purchaseData) setPurchasedIds([...new Set(purchaseData.map((d: { material_id: string }) => d.material_id))]);
      }
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setUserInitial((session.user.user_metadata?.full_name || session.user.email).charAt(0).toUpperCase());
        setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
        await loadProfile();
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user?.email) {
        setUserInitial((session.user.user_metadata?.full_name || session.user.email).charAt(0).toUpperCase());
        setUserName(session.user.user_metadata?.full_name || session.user.email.split("@")[0]);
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (content = "all", method = "all") => setModal({ content, method });
  const closeModal = () => setModal(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const container = document.getElementById("main-scroll");
    if (el && container) container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const SB_CLOSED = 72;
  const SB_OPEN = 300;
  const navSections = [
  { section: t("main"),   items: navItems.slice(0, 2) },
  { section: t("mypage"), items: navItems.slice(2, 5) },
  { section: t("service"), items: navItems.slice(5) },
];
if (isMobile) return <MobileHome />;
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8f4f4", overflow: "hidden", position: "relative" }}>
      <aside style={{ width: sbOpen ? SB_OPEN : SB_CLOSED, transition: "width 0.22s ease", background: "transparent", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "visible", zIndex: 10 }}>
        <div style={{ flexShrink: 0 }}>
          {sbOpen ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
              <img src="/toolio_logo.png" alt="toolio" style={{ height: 52, width: "auto", objectFit: "contain", display: "block" }} />
              <button onClick={() => setSbOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#aaa", fontSize: 22, lineHeight: 1, padding: "0 4px" }}>‹</button>
            </div>
          ) : (
            <button onClick={() => setSbOpen(true)} style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#aaa" strokeWidth="2"><path d="M6 3l5 5-5 5" /></svg>
            </button>
          )}
        </div>
        <div className="toolio-scroll-y" style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
          {navSections.map(({ section, items }) => (
            <div key={section}>
              {sbOpen && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#c0a0a0", padding: "8px 18px 3px", whiteSpace: "nowrap" }}>{section}</div>}
              {items.map((item) => (
                <div key={item.id} onClick={() => {if (item.id === "materials") { openModal("all", "all")} else {setActivePage(item.id);}}} style={{ display: "flex", alignItems: "center", gap: 12, padding: sbOpen ? "9px 14px" : "9px 0", justifyContent: sbOpen ? "flex-start" : "center", cursor: "pointer", borderRadius: 10, margin: sbOpen ? "1px 8px" : "1px 4px", whiteSpace: "nowrap", background: "transparent" }}>
                  <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 10, background: activePage === item.id ? "rgba(163,192,255,0.15)" : "transparent", transition: "background 0.15s" }}>
                    {item.icon(item.id, activePage === item.id)}
                  </div>
                  {sbOpen && (
                    <>
                      <span style={{ fontSize: 13, fontWeight: 600, color: activePage === item.id ? "#7040b0" : "#666" }}>{item.label}</span>
                      {item.badge && <span style={{ marginLeft: "auto", fontSize: 10, background: "#ffe8f4", color: "#b0427a", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>{item.badge}</span>}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 6px", flexShrink: 0, position: "relative" }}>
  {guestMenuOpen && !isLoggedIn && (
  <>
    <div onClick={() => setGuestMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
    <GuestLoginPopup
      userIconRef={userIconRef}
      onClose={() => setGuestMenuOpen(false)}
      onRouterPush={(href) => { setGuestMenuOpen(false); router.push(href); }}
      sbOpen={sbOpen}
    />
  </>
)}
  {userMenuOpen && isLoggedIn && (
  <>
    <div onClick={() => setUserMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
    <UserMenuPopup
      userIconRef={userIconRef}
      userInitial={userInitial}
      avatarUrl={avatarUrl}
      userName={userName}
      onClose={() => setUserMenuOpen(false)}
      onNavigate={(page) => { setUserMenuOpen(false); setActivePage(page); }}
      onRouterPush={(href) => { setUserMenuOpen(false); router.push(href); }}
      onLogout={async () => {
        setUserMenuOpen(false);
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        router.refresh();
      }}
      sbOpen={sbOpen}
      userPlan={profile.plan ?? "free"}
      cancelAtPeriodEnd={profile.cancel_at_period_end ?? false}
      currentPeriodEnd={profile.current_period_end ?? null}
      tm={tm}
    />
  </>
)}
  <div ref={userIconRef} onClick={() => { if (!isLoggedIn) { setGuestMenuOpen(!guestMenuOpen); } else { setUserMenuOpen(!userMenuOpen); } }} style={{ display: "flex", alignItems: "center", gap: 8, padding: sbOpen ? "6px 10px" : "6px 0", justifyContent: sbOpen ? "flex-start" : "center", borderRadius: 10, cursor: "pointer", background: userMenuOpen ? "rgba(163,192,255,0.1)" : "transparent" }}>
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0, overflow: "hidden" }}>
      {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : userInitial}
    </div>
    {sbOpen && <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#555", whiteSpace: "nowrap" }}>{isLoggedIn ? userName : "ゲスト"}</div><div style={{ fontSize: 11, color: "#999" }}>{isLoggedIn ? (
  <>
    {profile.plan === "light" ? "ライトプラン" : profile.plan === "standard" ? "スタンダードプラン" : profile.plan === "premium" ? "プレミアムプラン" : "無料プラン"}
    {profile.cancel_at_period_end && profile.current_period_end && (
      <span style={{ fontSize: 10, color: "#a04020", display: "block" }}>
        {new Date(profile.current_period_end).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })}まで利用可能
      </span>
    )}
  </>
) : "未登録"}</div></div>}
    {sbOpen && isLoggedIn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>}
  </div>
  <div style={{ display: "flex", justifyContent: sbOpen ? "stretch" : "center", marginTop: 4 }}>
    <button onClick={switchLanguage}style={{ fontSize: sbOpen ? 11 : 14, padding: sbOpen ? "5px 10px" : "5px 6px", width: sbOpen ? "100%" : "auto", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 8, background: "rgba(255,255,255,0.4)", color: "#888", cursor: "pointer" }}>
      {sbOpen ? (locale === 'ja' ? "🌐 日本語 / EN" : "🌐 EN / 日本語") : "🌐"}
    </button>
  </div>
  {sbOpen && (
  <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "10px 0 4px", flexWrap: "wrap" }}>
    <Link href="/terms" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>利用規約</Link>
    <span style={{ fontSize: 11, color: "#ddd" }}>|</span>
    <Link href="/privacy" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>プライバシー</Link>
    <span style={{ fontSize: 11, color: "#ddd" }}>|</span>
    <Link href="/tokushoho" style={{ fontSize: 11, color: "#ccc", textDecoration: "none" }}>特商法</Link>
  </div>
)}
<div style={{ textAlign: "center", padding: "2px 0 8px", fontSize: 11, color: "#ccc" }}>
  © 2026 toolio
</div>
</div>
      </aside>

      <main id="main-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0, background: "white", borderRadius: "16px 16px 0 0", margin: "12px 12px 0 0", boxShadow: "0 -4px 24px rgba(200,150,150,0.15)" }}>
        {activePage === "home" && (
          <>
            <section style={{ padding: "120px 48px 60px", textAlign: "center", background: "linear-gradient(to bottom, rgba(255,255,255,0) 10%, rgba(255,255,255,1) 28%), linear-gradient(to right, rgba(244,185,185,0.55) 0%, rgba(228,155,253,0.55) 50%, rgba(163,192,255,0.55) 100%)", borderRadius: "16px 16px 0 0" }}>
              <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.55)", textTransform: "uppercase", marginBottom: 18 }}>{th("hero_sub")}</p>
              <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.55, marginBottom: 16, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "var(--font-libre)" }}>{th("hero_title")}</h1>
              <p style={{ fontSize: 16, color: "#999", marginBottom: 64, lineHeight: 1.9 }}>{th("hero_desc1")}<br />{th("hero_desc2")}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                <button onClick={() => scrollTo("anchor-content")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white" }}>{th("browse_content")}</button>
                <button onClick={() => scrollTo("anchor-method")} style={{ fontSize: 15, padding: "14px 32px", borderRadius: 28, border: "none", cursor: "pointer", fontWeight: 700, background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", color: "white" }}>{th("browse_method")}</button>
              </div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12, letterSpacing: 2 }}>or</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
                <button onClick={() => openModal("all", "all")} style={{ fontSize: 15, padding: "14px 48px", borderRadius: 28, border: "1px solid rgba(163,192,255,0.5)", cursor: "pointer", fontWeight: 700, background: "white", color: "#7a50b0" }}>{th("view_all")}</button>
              </div>
              {!isLoggedIn && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "linear-gradient(135deg,rgba(244,185,185,0.12),rgba(228,155,253,0.12))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "14px 40px" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#b090d0", marginBottom: 3 }}>会員登録すると全機能が使えます</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0" }}>無料でアカウント作成 →</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => router.push("/auth?mode=login")} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "0.5px solid #c9a0f0", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>ログイン</button>
                    <button onClick={() => router.push("/auth")} style={{ fontSize: 12, padding: "7px 28px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer", fontWeight: 700 }}>新規登録</button>
                  </div>
                </div>
              )}
            </section>

            <section id="anchor-content" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Content</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_content_label")}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {contentItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal(item.contentId ?? "all", "all")} />)}
              </div>
            </section>

            <section id="anchor-method" suppressHydrationWarning style={{ padding: "80px 0 72px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", background: "white", textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
               å<div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#a3c0ff)", flexShrink: 0 }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#bbb", fontFamily: "var(--font-libre)" }}>Browse by Method</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "var(--font-libre)" }}>{th("browse_method_label")}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 16, flexWrap: "wrap", padding: "0 32px" }}>
                {methodItems.map((item) => <IconItem key={item.label} item={item} onClick={() => openModal("all", item.methodId ?? "all")} />)}
              </div>
            </section>

            <section style={{ padding: "64px 36px 80px", flex: 1, background: "white" }}>
              <div style={{ background: "#fafafa", border: "0.5px solid #eee", borderRadius: 12, padding: "18px 22px", marginBottom: 30 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f4b9b9" }} />{th("notice")}
                </div>
                {announcements.length === 0 ? (
                 <div style={{ fontSize: 13, color: "#bbb" }}>お知らせはありません</div>
                 ) : announcements.map((n) => (
                 <div key={n.id} style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                   <span style={{ fontSize: 13, color: "#bbb", minWidth: 88, flexShrink: 0 }}>{n.date}</span>
                   <span style={{ fontSize: 13, color: "#444" }}>{n.title}</span>
                 </div>
                ))}
              </div>
              <PersonalizedSection
                materials={materials}
                favIds={effectiveFavIds}
                dlIds={topDlIds}
                userPlan={profile.plan ?? "free"}
                isLoggedIn={isLoggedIn}
                purchasedIds={purchasedIds}
                locale={locale}
                onCardClick={(mat) => setTopTeaserMat(mat)}
                onFavToggle={async (mat) => {
                  const supabase = createClient();
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) return;
                  if (topFavIds.includes(mat.id)) {
                    await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                    setTopFavIds((prev) => prev.filter((id) => id !== mat.id));
                    window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
                  } else {
                    await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                    setTopFavIds((prev) => [...prev, mat.id]);
                    window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
                  }
                }}
                onPlanChanged={loadProfile}
              />
              <div style={{ display: "flex", borderBottom: "0.5px solid #eee", marginBottom: 24, marginTop: 48 }}>
                {[
                { key: "pickup", label: th("pickup") },
                { key: "recommended", label: th("recommended") },
                { key: "ranking", label: th("ranking") },
                { key: "new", label: th("new") },
                ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 14, padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === key ? "2px solid #9b6ed4" : "2px solid transparent", color: activeTab === key ? "#9b6ed4" : "#bbb", cursor: "pointer", fontWeight: 600, marginBottom: -0.5 }}>
                {label}{key === "new" && <span style={{ fontSize: 10, fontWeight: 700, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>NEW</span>}
              </button>
                ))}
                  
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
  {materialsLoading ? (
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} style={{ borderRadius: 14, border: "0.5px solid #eee", overflow: "hidden", background: "white" }}>
        <div className="skeleton" style={{ height: 120 }} />
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skeleton" style={{ height: 13, width: "75%" }} />
          <div className="skeleton" style={{ height: 11, width: "50%" }} />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <div className="skeleton" style={{ height: 18, width: 40, borderRadius: 9 }} />
            <div className="skeleton" style={{ height: 18, width: 40, borderRadius: 9 }} />
          </div>
        </div>
      </div>
    ))
  ) : materials
    .filter((mat) => {
      if (activeTab === "pickup") return mat.isPickup === true;
      if (activeTab === "recommended") return mat.isRecommended === true;
      if (activeTab === "ranking") return mat.ranking !== null;
      if (activeTab === "new") return mat.isNew === true;
      return true;
    })
    .sort((a, b) => {
      if (activeTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
      return 0;
    })
    .slice(0, 8)
    .length === 0 ? (
      <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 14 }}>該当する教材がありません</div>
    ) : (
      materials
        .filter((mat) => {
          if (activeTab === "pickup") return mat.isPickup === true;
          if (activeTab === "recommended") return mat.isRecommended === true;
          if (activeTab === "ranking") return mat.ranking !== null;
          if (activeTab === "new") return mat.isNew === true;
          return true;
        })
        .sort((a, b) => {
          if (activeTab === "ranking") return (a.ranking ?? 999) - (b.ranking ?? 999);
          return 0;
        })
        .slice(0, 8)
        .map((mat) => {
          const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(mat, locale);
          return (
            <MaterialCard
              key={mat.id}
              mat={mat}
              onClick={() => setTopTeaserMat(mat)}
              locale={locale}
              isLoggedIn={isLoggedIn}
              userPlan={profile.plan ?? "free"}
              favIds={effectiveFavIds}
              purchasedIds={purchasedIds}
              bg={bg} char={char} charColor={charColor}
              tag={tag} tagBg={tagBg} tagColor={tagColor}
              onFavToggle={async (mat) => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                if (topFavIds.includes(mat.id)) {
                  await supabase.from("favorites").delete().eq("user_id", session.user.id).eq("material_id", mat.id);
                  setTopFavIds((prev) => prev.filter((id) => id !== mat.id));
                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: false } }));
                } else {
                  await supabase.from("favorites").insert({ user_id: session.user.id, material_id: mat.id });
                  setTopFavIds((prev) => [...prev, mat.id]);
                  window.dispatchEvent(new CustomEvent("toolio:fav-change", { detail: { materialId: mat.id, isFav: true } }));
                }
              }}
            />
          );
        })
    )}
</div>
            </section>
          </>
        )}

        {activePage !== "home" && (
          activePage === "guide" ? (
            <GuideSection />

            ) : activePage === "trouble" ? (
    <TroubleSection
                    onOpenModal={() => setModal({ content: "all", method: "all" })}
                    onHome={() => { setActivePage("home"); const c = document.getElementById("main-scroll"); if (c) c.scrollTo({ top: 0, behavior: "instant" }); }}
                  />

  ) : (
    <MyPage
      activePage={activePage}
      setActivePage={setActivePage}
      isLoggedIn={isLoggedIn}
      userInitial={userInitial}
      setUserInitial={setUserInitial}
      avatarUrl={avatarUrl}
      setAvatarUrl={setAvatarUrl}
      userName={userName}
      setUserName={setUserName}
      userEmail={userEmail}
      profile={profile}
      setProfile={setProfile}
      editingField={editingField}
      setEditingField={setEditingField}
      editingValue={editingValue}
      setEditingValue={setEditingValue}
      materials={materials}
      contentTabs={contentTabs}
      methodTabs={methodTabs}
      locale={locale}
      tmm={tmm}
      tm={tm}
      navItems={navItems}
      onPlanChanged={loadProfile}
    />
  )
        )}
      </main>

      {topTeaserMat && (() => {
  const { bg, char, charColor, tag, tagBg, tagColor } = getCardStyle(topTeaserMat, locale);
  return (
    <TeaserModal
      mat={topTeaserMat}
      bg={bg} char={char} charColor={charColor}
      tag={tag} tagBg={tagBg} tagColor={tagColor}
      isLoggedIn={isLoggedIn}
      userPlan={profile.plan ?? "free"}
      favIds={topFavIds}
      purchasedIds={purchasedIds}
      contentTabs={contentTabs}
      methodTabs={methodTabs}
      locale={locale}
      tmm={tmm}
      onClose={() => setTopTeaserMat(null)}
      onFavChange={(materialId, isFav) => {
        if (isFav) setTopFavIds(prev => [...prev, materialId]);
        else setTopFavIds(prev => prev.filter(id => id !== materialId));
      }}
    />
  );
})()}
  

      {modal && (
        <MaterialsModal
          initContent={modal.content}
          initMethod={modal.method}
          onClose={closeModal}
          isLoggedIn={isLoggedIn}
          materials={materials}
          tmm={tmm}
          contentTabs={contentTabs}
          methodTabs={methodTabs}
          locale={locale}
          userPlan={profile.plan ?? "free"}
        />
      )}
    </div>
  );
}