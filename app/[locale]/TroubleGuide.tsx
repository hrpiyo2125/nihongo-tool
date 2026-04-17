"use client";
import { useState } from "react";
import { BrandIcon } from "../../components/BrandIcon";
function TroubleNav({ onHome, onTop }: { onHome: () => void; onTop: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: "0.5px solid rgba(200,170,240,0.15)", marginTop: 8 }}>
      <button onClick={onTop} style={{ fontSize: 12, padding: "8px 18px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.4)", background: "white", color: "#9b6ed4", cursor: "pointer", fontWeight: 600 }}>
        ← 何から始める？に戻る
      </button>
      <button onClick={onHome} style={{ fontSize: 12, padding: "8px 18px", borderRadius: 20, border: "0.5px solid rgba(200,170,240,0.4)", background: "white", color: "#aaa", cursor: "pointer", fontWeight: 600 }}>
        <BrandIcon name="home" size={13} color="#aaa" style={{ marginRight: 4 }} /> ホームに戻る
      </button>
    </div>
  );
}

function TroubleSection({ onOpenModal, onHome }: { onOpenModal: () => void; onHome: () => void }) {
  const [tab, setTab] = useState("start");
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
  const scrollToTop = () => {
    const container = document.getElementById("main-scroll");
    if (container) container.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "48px 48px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Trouble Shooting</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>お悩み解決</h2>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.8 }}>日本語指導でよくあるお悩みに、一緒に向き合います。</p>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(200,170,240,0.25)", gap: 0, overflowX: "auto" as const }}>
          {troubleTabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); scrollToTop(); }} style={{ padding: "12px 20px", border: "none", borderBottom: active ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#aaa", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 24 }}>
 {tab === "start" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* リード文 */}
    <p style={{ fontSize: 14, color: "#555", lineHeight: 1.9, margin: 0 }}>
      子どもに日本語を教える時、こんなこと、ありませんか？
    </p>

    {/* 実体験ブロック */}
    <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
      
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
  
  {[
    { icon: "note", before: "ひらがな50音表を書く", after: "緊張感があって、楽しんでいるように見えない…" },
    { icon: "note", before: "語彙や文の練習問題を重ねる", after: "プリントを出すと嫌がる。準備も意外と大変。" },
    { icon: "books", before: "子ども向けの教科書を使う", after: "教科書を出すと、途端に嫌がる。" },

  ].map((item, i) => (
    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <BrandIcon name={item.icon as Parameters<typeof BrandIcon>[0]["name"]} size={16} color="#c9a0f0" />
        <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{item.before}</span>
      </div>
      <div style={{ fontSize: 18, color: "#ddd", flexShrink: 0 }}>→</div>
      <div style={{ fontSize: 13, color: "#888", fontWeight: 400, lineHeight: 1.6 }}>{item.after}</div>
    </div>
  ))}
</div>
    </div>

    {/* まとめ文 */}
  

<div style={{ borderLeft: "3px solid #e49bfd", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>そして毎回、終わった後——</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    「これでよかったのかな」「もっと楽しくできたかも」　　　そんなふうに感じたこと、ありませんか。
  </p>
</div>

    <div style={{ borderLeft: "3px solid #a3c0ff", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>でも、子どもってかるた、大好きですよね。</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    毎回同じかるたでも、飽きずにやってくれる。そしてそのかるたの言葉は、気づいたらすんなり覚えてしまっている。
  </p>
</div>
    
    {/* ループ図 */}
    <p style={{ fontSize: 18, fontWeight: 800, color: "#444", lineHeight: 1.9, margin: 40, textAlign: "center" as const }}>
  日本語を話すために必要な内容すべてを、このように楽しくできれば——そう思って考えたのが、toolioの構成です。
</p>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start"  }}>
      <img
  src="/tanoshii_dekita.png"
  alt="たのしい→できた！の繰り返しで成長する階段図"
  style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12 }}
/>
<div style={{ marginTop: 24, fontSize: 13, color: "#777", lineHeight: 1.9, textAlign: "left" as const }}>
  このように、学習の中で「たのしい」→「できた！」をたくさん繰り返します。
  同じ体験を繰り返しながら、少しずつステップアップさせていくと、最後には大きな「できた！」になります。
  この大きな「できた！」は、私たちが目標とする、"日本語で話せるようになる”になります。
</div>

<div style={{ height: 24 }} />
{/* レベルの説明 */}
<p style={{ fontSize: 13, color: "#777", lineHeight: 1.9, margin: 0, textAlign: "left" as const }}>
  でも、毎回同じ内容で「たのしい→できた！」を繰り返しているだけでは、大きな「できた！」には辿り着けません。そのために必要なのが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>レベルを少しずつ上げていくこと</span>です。
</p>




<img
  src="/toollevel.png"
  alt="Basic・Middle・Advancedの3段階レベル図"
 style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12 }}
/>
<div style={{ height: 32 }} />
<p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0, textAlign: "left" as const }}>
  楽しい活動で子どものモチベーションを維持しながら、少しずつレベルを上げていく。これって、最高の流れだと思いませんか？
</p>
<div style={{ height: 32 }} />
    </div>

   {/* toolioの核心ブロック */}
<div style={{ borderLeft: "3px solid #f4b9b9", background: "#fafafa", borderRadius: "0 12px 12px 0", padding: "16px 20px" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 8 }}>でも——</p>
  <p style={{ fontSize: 13, color: "#777", lineHeight: 1.85, margin: 0 }}>
    このような「たのしい→できた！」を実現できる教材って、作ろうと思うと準備が大変ですよね。そんな時に生み出したのが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>toolio</span>です。
  </p>
</div>

<div style={{ height: 24 }} />

<div style={{ border: "0.5px solid rgba(228,155,253,0.5)", borderRadius: 14, padding: "40px 30px", background: "linear-gradient(135deg,rgba(252,228,248,0.3),rgba(221,238,255,0.3))" }}>
  <p style={{ fontSize: 14, fontWeight: 700, color: "#444", lineHeight: 1.85, textAlign: "center" as const }}>
    toolioは、子どもに楽しく日本語を学習してもらいたい、そしてそれを支える先生や保護者の方々の力になりたい、と言う思いから生まれました。
  </p>
</div>

<div style={{ height: 24}} />

{/* 新ステップ構成 */}
<div style={{ display: "flex", flexDirection: "column" as const, gap: 48 }}>

  {/* 3ステップ概要 */}
  <div style={{ display: "flex", gap: 0, alignItems: "center", justifyContent: "center" }}>
    {[
      { num: "01", label: "レベルを知る" },
      { num: "02", label: "ゴールを設定する" },
      { num: "03", label: "教材を使って教える" },
    ].map((item, i, arr) => (
      <div key={item.num} style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>{item.num}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", whiteSpace: "nowrap" as const }}>{item.label}</div>
        </div>
        {i < arr.length - 1 && <div style={{ fontSize: 20, color: "#ddd", margin: "0 12px", paddingBottom: 20 }}>→</div>}
      </div>
    ))}
  </div>
  <div style={{ height: 8}} />
  {/* STEP 1: レベルを知る */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>01</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>レベルを知る</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>初回だけでOK</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      レベルを知ることで、正確なスタート地点を決めることができます。これがないと——
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        <img src="/toodifficult.png" alt="難しすぎる場合" style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, padding: "10px 14px", background: "#f0f0f0", borderRadius: 10, minHeight: 80, textAlign: "center" as const }}>
          内容がむずかしすぎた場合、子どものレベルとかけ離れていて理解できない、やる気が出ないと言うことが起きます。
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        <img src="/tooeasy.png" alt="簡単すぎる場合" style={{ width: "100%", borderRadius: 10, display: "block" }} />
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, padding: "10px 14px", background: "#f0f0f0", borderRadius: 10, minHeight: 80, textAlign: "center" as const }}>
          内容が簡単すぎた場合、すでにわかっていることなのでつまらない、と言うことが起きてしまいます。
        </div>
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button  onClick={() => { setTab("level"); scrollToTop(); }}style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        詳しいチェックの仕方はこちら →
      </button>
    </div>
  </div>

  <div style={{ display: "flex", justifyContent: "center", fontSize: 16, color: "#ddd" }}>↓</div>

  {/* STEP 2: ゴールを設定する */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>02</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>ゴールを設定する</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>毎回の作業</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      具体的に考えなくてOKです。子どもの日ごろの観察により、「どんなことをやったほうがいいか」を決めてみましょう。これをやることで、どんな内容をやるかを具体的に決められます。
    </div>
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button onClick={() => { setTab("goal"); scrollToTop(); }} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        目標の決め方はこちら →
      </button>
    </div>
  </div>

  <div style={{ display: "flex", justifyContent: "center", fontSize: 16, color: "#ddd" }}>↓</div>

  {/* STEP 3: 教材を選んで実践 */}
  <div style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "24px 28px 36px", display: "flex", flexDirection: "column" as const, gap: 20 }}>
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>03</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#333" }}>教材を選んで実践！</div>
        <div style={{ fontSize: 12, color: "#b090c8", marginTop: 2 }}>レベルとゴールの間にある教材を選ぶ</div>
      </div>
    </div>
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9 }}>
      2つが決まったら、その間にある教材を選んで実践しましょう！
    </div>
    <img src="/choose.png" alt="教材を選ぶ" style={{ width: "100%", maxWidth: 680, display: "block", margin: "0 auto", borderRadius: 12, mixBlendMode: "multiply" as const }} />
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
  </div>
  </div>
    {/* 締めの言葉 */}
    <div style={{ textAlign: "center" as const, padding: "32px 24px", background: "linear-gradient(135deg,rgba(244,185,185,0.15),rgba(228,155,253,0.15),rgba(163,192,255,0.15))", borderRadius: 16, border: "0.5px solid rgba(200,170,240,0.25)" }}>
      <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.6, marginBottom: 8 }}>
        さあ、toolioと一緒に始めましょう。
      </div>
      <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>
        まずは気になった教材を1つ、試してみてください。
      </div>
      <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
    </div>

  </div>
)}
 {tab === "level" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ① 日常の中で観察しよう */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      テストしなくて大丈夫。レベルは、日常の会話の中でざっくり観察するだけで十分です。<br />
      大切なのは「できないこと」を探すのではなく、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「できること」を見つけること</span>。できることが見えれば、最初の一歩が自信を持って踏み出せます。
    </div>

    {/* ② やさしい日本語とは？ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やさしい日本語で話しかけてみよう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        子どもに日本語で話しかけるとき、難しい言葉・長い文・早口では正確に伝わりません。まず「やさしい日本語」を意識してみましょう。
      </div>

      {/* 3つのポイント */}
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 16 }}>
        {[
          { icon: "scissors" as const, point: "短く話す", desc: "一文に一つの内容だけ。「ごはん、食べた？」" },
          { icon: "timer" as const, point: "ゆっくり話す", desc: "急がず、間をとって。子どもが処理する時間を作る" },
          { icon: "chat" as const, point: "知っている言葉を使う", desc: "「食事」より「ごはん」。子どもが知っていそうな言葉で" },
        ].map((item) => (
          <div key={item.point} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name={item.icon} size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 3 }}>{item.point}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* NG→OK例 */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 10 }}>NG → OK の例</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { ng: "今日学校でどんなことがあったか教えて", ok: "今日、楽しかった？" },
          { ng: "急いで準備しないと遅刻するよ", ok: "はやく！急いで！" },
          { ng: "この字、なんて読むかわかる？", ok: "これ、読める？" },
          { ng: "もう少し大きな声で話してみて", ok: "もっと大きい声で" },
        ].map((item) => (
          <div key={item.ng} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f4b9b9", marginBottom: 3 }}>NG</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{item.ng}</div>
            </div>
            <div style={{ fontSize: 16, color: "#ddd" }}>→</div>
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(163,192,255,0.1))", borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#a3c0ff", marginBottom: 3 }}>OK ✅</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.ok}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ③ 四技能チェックリスト */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>日常の中でチェックしてみよう</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>やさしい日本語で話しかけながら、できることに✓を入れてみましょう。</div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {[
          {
            skill: "聞く",
            icon: "chat" as const,
            color: "#e8efff",
            border: "rgba(163,192,255,0.4)",
            titleColor: "#3a5a9a",
            items: [
              "名前を呼ばれたら振り向く",
              "「座って」「来て」など簡単な指示がわかる",
              "「〇〇はどこ？」という質問に体や指で答えられる",
              "短いお話を最後まで聞ける",
              "話の内容について「うん」「ちがう」で答えられる",
            ],
          },
          {
            skill: "話す",
            icon: "megaphone" as const,
            color: "#fce4f8",
            border: "rgba(228,155,253,0.4)",
            titleColor: "#7a2e7a",
            items: [
              "単語（「おなかすいた」「いや」など）で気持ちを伝えられる",
              "「〇〇したい」「〇〇がすき」と言える",
              "経験を一文で話せる（「公園いった」など）",
              "知らない言葉を身振りや別の言葉で伝えようとする",
              "日本語で話しかけられたとき、日本語で返そうとする",
            ],
          },
          {
            skill: "読む",
            icon: "open-book" as const,
            color: "#fff8e0",
            border: "rgba(240,200,80,0.4)",
            titleColor: "#7a5a00",
            items: [
              "自分の名前がひらがなで読める",
              "ひらがな50音がだいたい読める",
              "短い単語（「ねこ」「りんご」など）が読める",
              "簡単な文（「ねこがいる」など）が読める",
              "初めて見た文章を自分で読もうとする",
            ],
          },
          {
            skill: "書く",
            icon: "pencil" as const,
            color: "#d6f5ee",
            border: "rgba(109,207,184,0.4)",
            titleColor: "#0d5c4a",
            items: [
              "自分の名前がひらがなで書ける",
              "見本を見ながらひらがなが書ける",
              "見本なしでひらがなが書ける",
              "短い文が書ける（「わたしは〇〇です」など）",
              "自分の考えを文章で書こうとする",
            ],
          },
        ].map((skill) => (
          <div key={skill.skill} style={{ background: skill.color, border: `0.5px solid ${skill.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <BrandIcon name={skill.icon} size={20} color={skill.titleColor} />
              <span style={{ fontSize: 14, fontWeight: 700, color: skill.titleColor }}>{skill.skill}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {skill.items.map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${skill.border}`, background: "white", flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 印刷ボタン */}
      <button style={{ marginTop: 14, fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.5)", background: "white", color: "#7a50b0", cursor: "pointer" }}>
        📄 チェックリストを印刷する（準備中）
      </button>
    </div>

    {/* ④ チェックした後は？ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 10 }}>チェックした後は？</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, marginBottom: 16 }}>
        チェックが多くついた力が、今のお子さんの<span style={{ fontWeight: 700, color: "#7a50b0" }}>得意な入口</span>です。その力から使える教材を選ぶと、最初の一歩が踏み出しやすくなります。toolioの教材はレベルで縛っていません。同じ教材でも使い方次第でどのレベルにも使えます。
      </div>
      <button onClick={() => { setTab("material"); scrollToTop(); }} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        どの教材を使えばいい？ →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}
{tab === "material" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ① チェックリストの結果を活かして選ぼう */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>チェックリストの結果を活かして選ぼう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        レベルチェックの結果を参考に、得意な力から入るのが一番スムーズです。
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "👂🗣", skill: "聞く・話すにチェックが多い", desc: "まず音声・会話系の教材から（かるた・カード・ロールプレイ）" },
          { icon: "📖", skill: "読むに興味が出てきた", desc: "ひらがな・文字系の教材から（練習シート・読み物）" },
          { icon: "✏️", skill: "書くが得意", desc: "練習シート・ドリル系から始めてみましょう" },
        ].map((item) => (
          <div key={item.skill} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 3 }}>{item.skill}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>→ {item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: "#888", lineHeight: 1.8, padding: "12px 16px", background: "#f8f6ff", borderRadius: 10 }}>
        ただし、レベルの縛りはありません。同じ教材でも使い方次第でどのレベルにも使えます。各教材ページの「使い方」タブに具体的な活用例を載せています。
      </div>
    </div>

    {/* ② Basic→Middle→Advancedって何？ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>Basic・Middle・Advancedって何？</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>
        toolioの教材には3つの活動の形があります。難しさが気づかないうちに上がっていくので、子どもはストレスなく自然にステップアップできます。
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
        {[
          {
            level: "Basic",
            icon: "card" as const,
            color: "#d6f5e5",
            border: "rgba(109,207,184,0.4)",
            titleColor: "#2a6a44",
            desc: "説明なしで飛び込める活動。ルールがシンプルで、すぐに「できた！」が生まれます。",
            examples: "かるた・カード・ぬりえ",
            dekita: "「札が取れた！」「全部塗れた！」",
          },
          {
            level: "Middle",
            icon: "gamepad" as const,
            color: "#e8efff",
            border: "rgba(163,192,255,0.4)",
            titleColor: "#3a5a9a",
            desc: "少しルールがある活動。Basicで触れた言葉が自然に出てきます。",
            examples: "ゲーム・クイズ・ビンゴ",
            dekita: "「全部言えた！」「勝った！」",
          },
          {
            level: "Advanced",
            icon: "megaphone" as const,
            color: "#ffe8f4",
            border: "rgba(244,185,185,0.4)",
            titleColor: "#a03070",
            desc: "やり取りが生まれる活動。気づいたら日本語で話せるようになっています。",
            examples: "ロールプレイ・インタビュー・お店屋さんごっこ",
            dekita: "「お店屋さんと話せた！」「インタビューできた！」",
          },
        ].map((item) => (
          <div key={item.level} style={{ background: item.color, border: `0.5px solid ${item.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <BrandIcon name={item.icon} size={20} color={item.titleColor} />
              <span style={{ fontSize: 14, fontWeight: 800, color: item.titleColor }}>{item.level}</span>
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, marginBottom: 8 }}>{item.desc}</div>
            <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>例：{item.examples}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: item.titleColor }}>できた！の例：{item.dekita}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#666", lineHeight: 1.8 }}>
        Basicから始めるのが入りやすいですが、順番の縛りはありません。「この教材、うちの子に合いそう」という直感で選んでOKです。toolioの教材はどの段階から入っても、活動の中で自然に「やりたい！」が生まれるように設計しています。
      </div>
    </div>

    {/* 授業例 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>授業の流れの例</div>

      {/* パターンA */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7a50b0", marginBottom: 12 }}>パターンA｜1回の授業で完結（約30分）</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>
          同じテーマをその日のうちにBasic→Middle→Advancedと進みます。毎回必ず「できた！」で終わるのがポイントです。
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {[
            { time: "導入（5分）", icon: "chat" as const, desc: "食べ物カードを見ながら「これ知ってる？」と話しかける" },
            { time: "Basic（10分）", icon: "card" as const, desc: "食べ物かるたで遊ぶ → 札が取れた！" },
            { time: "Middle（10分）", icon: "gamepad" as const, desc: "食べ物ビンゴをする → 全部言えた！" },
            { time: "Advanced（5分）", icon: "megaphone" as const, desc: "お買い物ロールプレイ → お店屋さんと話せた！" },
          ].map((step, i, arr) => (
            <div key={step.time}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <BrandIcon name={step.icon} size={18} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a0f0", marginBottom: 3 }}>{step.time}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", fontSize: 14, color: "#ddd" }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* パターンB */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#7a50b0", marginBottom: 12 }}>パターンB｜複数回にまたがる構成（例：3回）</div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>
          同じテーマで少しずつ難しくしていきます。前回の「できた！」が次回の土台になり、子どもが「あ、これ知ってる！」と自信を持って入れます。
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {[
            { time: "1回目", icon: "card" as const, desc: "食べ物かるたで遊ぶ（Basic）→ 札が取れた！で終わる" },
            { time: "2回目", icon: "gamepad" as const, desc: "食べ物ビンゴをする（Middle）→ 前回のかるたで覚えた言葉が出てくる！" },
            { time: "3回目", icon: "megaphone" as const, desc: "お買い物ロールプレイ（Advanced）→ 気づいたら話せるようになってた！" },
          ].map((step, i, arr) => (
            <div key={step.time}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <BrandIcon name={step.icon} size={18} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a0f0", marginBottom: 3 }}>{step.time}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{step.desc}</div>
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: "flex", justifyContent: "center", padding: "4px 0", fontSize: 14, color: "#ddd" }}>↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ③ 横断学習 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 8 }}>一つの活動で複数のことが学べる</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>
        toolioの教材は、一つの活動の中で別の学習項目も自然に深まるように設計されています。「これだけを教えよう」と構えなくても、活動の中で自然にいろんな言葉に触れられます。
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.25)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {[
            { icon: "🍎", text: "食べ物かるた → 食べ物の語彙＋「赤いいちご」で色にも自然に触れる" },
            { icon: "🛒", text: "お買い物ロールプレイ → 食べ物の語彙＋「3つください」で数＋会話表現が同時に深まる" },
            { icon: "🍂", text: "季節のぬりえ → 色の名前＋季節の語彙に同時に触れる" },
            { icon: "🐾", text: "動物カード → 動物の名前＋耳・しっぽなど体の部位も自然に出てくる" },
          ].map((item) => (
            <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ④ 子どもの興味も大切 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>子どもの興味も大切</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "target" as const, title: "好きなものから", desc: "車が好き→乗り物の語彙、動物が好き→動物の教材など、興味のあるテーマから入ると吸収が早い" },
          { icon: "calendar" as const, title: "季節・生活に合わせて", desc: "今の季節の教材、日常生活で使う言葉など、子どもの生活に近いものが定着しやすい" },
          { icon: "sparkle" as const, title: "「やってみたい！」を大切に", desc: "子どもが楽しそうと感じる教材を選ぶことが、続けるための一番の近道" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <BrandIcon name={item.icon} size={24} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ⑤ 教材一覧へ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>まずは気になった教材を1つ試してみましょう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>各教材ページの「使い方」タブに、レベル別・場面別の活用例を載せています。参考にしながら、自由に使ってみてください。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}
{tab === "teach" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* 共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      教え方に正解はありません。でも、こんなことを意識するだけで、子どもの反応がぐっと変わります。
    </div>

    {/* 心がけること */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>心がけること</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>

        {/* 1 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="gamepad" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>説明より先に「楽しい活動」から入る</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>説明から始めると子どもは構えてしまいます。まず活動に飛び込んで、やりながら自然に言葉に触れさせましょう。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>例えば——</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.8, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                「今日はかるたをやろう！」とカードを広げるだけでOK。ルールの説明は最小限に、まずやってみる。やっているうちに子どもが自然にルールを覚えていきます。
              </div>
            </div>
          </div>
        </div>

        {/* 2 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="chat" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>先生がさりげなく言葉を添える</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>「これは○○だよ」と教え込むのではなく、活動の中でさりげなく言葉を添えるだけで十分です。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>声かけの例——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "札を取った瞬間に「いちご！赤いね」とさりげなく言う",
                  "子どもが指さしたら「そう、これはりんごだね」と繰り返す",
                  "正解・不正解より「言葉を拾う」感覚で",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="star" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>必ず「できた！」で終わる</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>最後は子どもが「できた！」と感じられる活動で締めくくりましょう。こんな工夫を取り入れてみてください。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>工夫の例——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "抜き打ちで「これ言える？」と聞いてみる → 自然に言えた！という達成感が生まれる",
                  "できた札・カードを手元に集めておく → 「これだけ取れた！」と目で見てわかる",
                  "前回できなかったことをもう一度やってみる → 「あ、今回はできた！」と成長を自分で感じられる",
                  "できた言葉をノートや紙に書き留める → 積み重なっていく「できた！」が目に見える形になる",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="search" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>疲れたサインを見逃さない</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>集中できる時間は子どもによって違います。サインを感じたら「今日はここまで」と早めに切り上げてOKです。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <div style={{ background: "#fff0f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, color: "#c07070", fontWeight: 700, marginBottom: 6 }}>こんなサインに気をつけて——</div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                    {["視線がそれる・返事が遅くなる", "ぼーっとする・欠伸が出る", "関係ない話を始める・席を立とうとする"].map((item) => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f4b9b9", flexShrink: 0, marginTop: 7 }} />
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "#f0fff4", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, color: "#2a6a44", fontWeight: 700, marginBottom: 6 }}>対処——</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>「今日はここまでにしよう」と切り上げる・別の簡単な活動に切り替えてから終わる</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="heart" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>できなくても責めない</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>「怒られないようにやる」ではなく「やりたいからやる」を大切に。間違えても大丈夫、という空気が「できる」を引き出します。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>こんな場面では——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "かるたの札が取れなかった → 「惜しかった！次は取れるよ」と切り替える",
                  "言葉が出てこなかった → 「そうそう、これは○○だよ」とさりげなくフォロー",
                  "間違えた → 「あ、そう聞こえるよね」と否定せず自然に正しい言葉を繰り返す",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name="star" size={20} color="white" /></div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>できた部分を認めてほめる</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7, marginBottom: 10 }}>できない部分には必ず原因があります。まずできていることを見つけて認めることが、子どもの自信につながります。</div>
              <div style={{ fontSize: 12, color: "#9b6ed4", fontWeight: 700, marginBottom: 6 }}>こんな伝え方で——</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, background: "#f8f6ff", borderRadius: 8, padding: "10px 14px" }}>
                {[
                  "「全部はできなかったけど、この3枚は全部言えたね！」",
                  "「先週より速く取れるようになったね」と変化を伝える",
                  "できた札だけ集めて「これだけ取れた！」と一緒に数える",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "linear-gradient(135deg,#e49bfd,#a3c0ff)", flexShrink: 0, marginTop: 7 }} />
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* 教材一覧へ */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>まずは楽しい活動から始めてみましょう</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>toolioの教材はすべて「まず楽しい活動ありき」で設計されています。説明は最小限。すぐに使えます。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}
{tab === "motivation" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      「やって」と言っても動かない。そのたびに消耗してしまう——そんな毎日、ありませんか。<br />
      でも「やる気がない」のではなく、「やる気が出る状況になっていない」だけかもしれません。
    </div>

    {/* ブロック2：やる気が出ない理由 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やる気が出ない、よくある理由</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "😮‍💨", title: "必要性を感じていない", desc: "「なんでやるの？」がわかっていない" },
          { icon: "🎯", title: "ゴールが見えない", desc: "何ができるようになるのかイメージできない" },
          { icon: "😞", title: "失敗が怖い", desc: "「また間違えたら嫌だ」という気持ちが先に立つ" },
          { icon: "🔋", title: "そもそも疲れている", desc: "学校・習い事・日常でエネルギーが残っていない" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：やる気のスイッチを押すヒント */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>やる気のスイッチを押すヒント</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "megaphone" as const, title: "「今日これだけやろう」と小さく始める", desc: "ハードルを下げるほど、動き出しやすくなる" },
          { icon: "gamepad" as const, title: "最初はゲームや遊びで気分を上げる", desc: "楽しい入口があると、本題にも乗りやすい" },
          { icon: "star" as const, title: "「できたこと」を毎回見えるようにする", desc: "シール・スタンプなど、小さな達成感を積み重ねる" },
          { icon: "calendar" as const, title: "決まった時間・場所でやる", desc: "「習慣」になると、やる気を待たなくてよくなる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name={step.icon} size={20} color="white" /></div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：やる気より大切なこと */}
    <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>やる気より大切なこと</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9 }}>
        やる気は「待つ」ものではなく、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「動いてから生まれる」</span>ものです。<br />
        まず小さな「できた！」を作ることが、一番の近道です。
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>短時間・ゲーム感覚で取り組める教材を揃えています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>「今日はこれだけ」から始めてみてください。小さな一歩が、続ける力になります。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}
        {tab === "bored" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      がんばって準備したのに、5分で「もうやだ」。そんな経験、ありませんか。<br />
      でも、飽きるのは子どものせいでも、教材のせいでもないことがほとんどです。「飽き」には、必ず理由があります。
    </div>

    {/* ブロック2：飽きの4パターン */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>飽きているとき、何が起きている？</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🧩", title: "難しすぎる", desc: "わからないから、やる気が出ない" },
          { icon: "😪", title: "簡単すぎる", desc: "達成感がなく、つまらなく感じる" },
          { icon: "😴", title: "疲れている", desc: "集中できる時間は子どもによって違う" },
          { icon: "💭", title: "興味がない", desc: "内容が自分ごとに感じられない" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：パターン別の対処法 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>パターン別の対処法</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "🧩", title: "難しすぎるとき", desc: "一つ前のステップに戻る。「できた！」の体験を作ってから進む。" },
          { icon: "😪", title: "簡単すぎるとき", desc: "スピードを競ったり、役割を逆にしたりしてゲームにする。" },
          { icon: "😴", title: "疲れているとき", desc: "時間を15分以内に区切る。「今日はここまで」と決めてOK。" },
          { icon: "💭", title: "興味がないとき", desc: "テーマを子どもの好きなものに変える。乗り物好きなら乗り物の語彙から。" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：授業設計のコツ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>授業設計のちょっとしたコツ</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { icon: "target" as const, text: "最初に「今日はこれをやるよ」と伝える" },
          { icon: "timer" as const, text: "1回の学習は15〜20分を目安に" },
          { icon: "check" as const, text: "終わりは「できたね」で締めくくる" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10 }}>
            <BrandIcon name={item.icon} size={18} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>toolioの教材は「飽きさせない」ために作っています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>ゲーム・カード・クイズなど、楽しみながら学べる教材を揃えています。子どもの「やってみたい！」を引き出すヒントが見つかるはずです。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}

{tab === "improve" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      何度やっても覚えない。同じ間違いを繰り返す。「この子、本当に大丈夫？」と不安になることありませんか。<br />
      でも「できるようにならない」には、必ず理由があります。焦らず、一緒に原因を探しましょう。
    </div>

    {/* ブロック2：よくある原因 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>よくある原因</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🔁", title: "インプットが足りない", desc: "練習回数・触れる量がまだ少ない" },
          { icon: "🧠", title: "定着する前に次へ進んでいる", desc: "「わかった」と「できる」は別物" },
          { icon: "📦", title: "使う場面がない", desc: "日常で使わないと記憶に残りにくい" },
          { icon: "😰", title: "プレッシャーがかかっている", desc: "緊張すると、知っていることも出てこない" },
          { icon: "books", title: "学習方法が合っていない", desc: "書くより話す・見るより聞くなど、得意な方法は子どもによって違う" },
        ].map((item) => (
          <div key={item.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <BrandIcon name={item.icon as Parameters<typeof BrandIcon>[0]["name"]} size={22} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：定着のための3ステップ */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>定着のための3ステップ</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "open-book" as const, title: "まず「知る」", desc: "教材・カードで内容に触れる。正確さより「なんとなくわかる」が大事" },
          { icon: "refresh" as const, title: "次に「慣れる」", desc: "ゲーム・かるたで繰り返す。楽しみながら自然に身につける" },
          { icon: "megaphone" as const, title: "最後に「使う」", desc: "会話・ロールプレイで実際に使ってみる。ここで初めて「できた」になる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name={step.icon} size={20} color="white" /></div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：環境と方法を見直す */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>環境と方法を見直してみましょう</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          {
            icon: "heart" as const,
            title: "リラックスできる環境を作る",
            desc: "テストのような雰囲気にしない。間違えても大丈夫、という空気が「できる」を引き出します。「怒られないようにやる」より「やりたいからやる」を大切に。",
          },
          {
            icon: "refresh" as const,
            title: "学習方法を変えてみる",
            desc: "書くのが苦手なら話してみる、見るより聞く方が入りやすい子もいる。同じ内容でもアプローチを変えるだけで、ぐんと定着が変わることがあります。",
          },
        ].map((item) => (
          <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ marginBottom: 10 }}><BrandIcon name={item.icon} size={22} color="#c9a0f0" /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック5：CTA */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>「知る→慣れる→使う」の流れで使える教材を揃えています</div>
      <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>方法を変えるヒントも、各教材ページの「使い方」タブで確認できます。</div>
      <button onClick={onOpenModal} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
        教材一覧を見る →
      </button>
    </div>
    <TroubleNav onHome={onHome} onTop={() => { setTab("start"); scrollToTop(); }} />
  </div>
)}
        {tab === "goal" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ブロック1：共感リード */}
    <div style={{ fontSize: 13, color: "#777", lineHeight: 1.9, background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "16px 20px" }}>
      「今日は50音表を練習する」——それ自体は悪くありません。でも、子どもにとって「何のためにやるのか」が見えないと、続きにくくなります。<br />
      目標は「何を学ぶか」より、<span style={{ fontWeight: 700, color: "#7a50b0" }}>「何ができるようになるか」</span>で考えてみましょう。
    </div>

    {/* ブロック2：Can-doで考えてみよう */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>Can-doで考えてみよう</div>
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 12 }}>「できた！」がわかる目標の例</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { before: "ひらがなを練習する", after: "お菓子のパッケージが読める" },
          { before: "あいさつを覚える", after: "朝起きたときに日本語であいさつできる" },
          { before: "数字を学ぶ", after: "お店で値段がわかる" },
          { before: "季節の語彙をやる", after: "「今日は寒いね」と日本語で話せる" },
        ].map((item) => (
          <div key={item.before} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ccc", marginBottom: 4 }}>学習ベース</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{item.before}</div>
            </div>
            <div style={{ fontSize: 18, color: "#ddd" }}>→</div>
            <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.1),rgba(163,192,255,0.1))", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c9a0f0", marginBottom: 4 }}>Can-doベース ✅</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.after}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ブロック3：1回の授業の目標の立て方 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>1回の授業の目標の立て方</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[
          { icon: "target" as const, title: "「今日のゴール」を最初に決める", desc: "子どもと一緒に「今日はこれができるようになろう」と確認する" },
          { icon: "note" as const, title: "Can-doの形で言葉にする", desc: "「〜を学ぶ」ではなく「〜ができるようになる」という形にする" },
          { icon: "check" as const, title: "最後に「できたね」を確認して終わる", desc: "ゴールに戻って振り返ることで、達成感が生まれる" },
        ].map((step, i, arr) => (
          <div key={step.title}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><BrandIcon name={step.icon} size={20} color="white" /></div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: "#777", lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* ブロック4：目標は小さいほど達成感が大きい */}
    <div style={{ background: "#f8f6ff", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#7a50b0", marginBottom: 10 }}>目標が小さいほど、達成感が大きい</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.9 }}>
        「ひらがなを全部覚える」より「今日はこの5文字が読める」。<br />
        小さなCan-doの積み重ねが、<span style={{ fontWeight: 700, color: "#7a50b0" }}>子どもの自信</span>になります。
      </div>
    </div>

    {/* ブロック5：CTA */}
<div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(163,192,255,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 12, padding: "20px 24px" }}>
  <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 8 }}>ゴールが決まったら、教材を選びましょう</div>
  <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>
    Can-doをもとに、そのゴールに向かって使える教材を選びましょう。各教材ページの「使い方」タブに、場面別・Can-do別の活用例を載せています。
  </div>
  <button onClick={() => { setTab("material"); scrollToTop(); }} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
    どの教材を使えばいい？ →
  </button>
</div>

  </div>
)}
      </div>
    </div>
  );
}

function GuideSection() {
  const [guideTab, setGuideTab] = useState("start");
  const guideTabs = [
    { id: "start",  label: "はじめての方へ",       icon: "sparkle" as const },
    { id: "find",   label: "教材の探し方",           icon: "search" as const },
    { id: "more",   label: "もっと活用したい",       icon: "star" as const },
    { id: "help",   label: "使っていてわからないとき", icon: "lightbulb" as const },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" as const }}>
      <div style={{ padding: "48px 48px 0", background: "linear-gradient(to bottom, rgba(255,255,255,0) 5%, rgba(255,255,255,1) 85%), linear-gradient(to right, rgba(244,185,185,0.4) 0%, rgba(228,155,253,0.4) 50%, rgba(163,192,255,0.4) 100%)", borderRadius: "16px 16px 0 0" }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(180,120,210,0.6)", textTransform: "uppercase" as const, marginBottom: 8 }}>Guide</p>
        <h2 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg,#f4b9b9,#e49bfd,#a3c0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 }}>使い方ガイド</h2>
        <p style={{ fontSize: 13, color: "#aaa", marginBottom: 28, lineHeight: 1.8 }}>お悩みに合わせて、toolioの使い方をご案内します。</p>
        <div style={{ display: "flex", borderBottom: "0.5px solid rgba(200,170,240,0.25)", gap: 0, overflowX: "auto" as const }}>
          {guideTabs.map((tab) => {
            const active = guideTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setGuideTab(tab.id)} style={{ padding: "12px 22px", border: "none", borderBottom: active ? "2px solid #9b6ed4" : "2px solid transparent", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "#7a50b0" : "#aaa", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                <BrandIcon name={tab.icon} size={14} color={active ? "#9b6ed4" : "#ccc"} />{tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "36px 48px 64px", display: "flex", flexDirection: "column" as const, gap: 36 }}>
        {guideTab === "start" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    {/* ステップ全体 */}
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 20 }}>toolioをはじめよう</div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {/* STEP 1 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>01</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>まず無料教材を試す</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>アカウント不要・登録なしで今すぐダウンロードできます。まずは気になった教材を1つ試してみてください。</div>
              {/* プレースホルダー：無料タグ・ダウンロードボタンのスクリーンショット */}
              <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, gap: 6, color: "#bbb", fontSize: 12 }}>
                <div style={{ fontSize: 20 }}>🖼</div>
                <div>無料タグ・ダウンロードボタンの画像</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

        {/* STEP 2 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>02</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>気に入ったら無料登録する</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 12 }}>登録するとこんな機能が使えるようになります。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 16 }}>
                {[
                  { icon: "heart" as const, title: "お気に入り保存", desc: "気になった教材をハートボタンで保存できます", placeholder: "お気に入りボタンの画像" },
                  { icon: "folder" as const, title: "ダウンロード履歴", desc: "過去にダウンロードした教材をいつでも再ダウンロードできます", placeholder: "ダウンロード履歴画面の画像" },
                ].map((item) => (
                  <div key={item.title} style={{ background: "#fafafa", border: "0.5px solid rgba(200,170,240,0.15)", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <BrandIcon name={item.icon} size={16} color="#c9a0f0" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7, marginBottom: 10 }}>{item.desc}</div>
                    {/* プレースホルダー */}
                    <div style={{ width: "100%", aspectRatio: "16/5", background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
                      <span>🖼</span><span>{item.placeholder}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

        {/* STEP 3 */}
        <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>03</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>サブスクプランに登録する</div>
              <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>プランに応じて使える教材が増えます。まずは気軽にLightプランから試してみてください。</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 16 }}>
                {[
                  { plan: "Light", price: "¥980", color: "#d6f5e5", textColor: "#2a6a44" },
                  { plan: "Standard", price: "¥1,980", color: "#e8efff", textColor: "#3a5a9a" },
                  { plan: "Premium", price: "¥3,980", color: "#ffe8f4", textColor: "#a03070" },
                ].map((item) => (
                  <div key={item.plan} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: item.color, borderRadius: 10, padding: "10px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.textColor }}>{item.plan}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.textColor }}>{item.price} / 月</div>
                  </div>
                ))}
              </div>
              <button onClick={() => window.location.href = "/plan"} style={{ fontSize: 13, fontWeight: 700, padding: "10px 24px", borderRadius: 20, border: "none", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", cursor: "pointer" }}>
                プランの詳細を見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 教材の探し方 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>教材の探し方</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
        {[
          { icon: "🔵", title: "学習内容のアイコンから探す", desc: "ひらがな・カタカナ・語彙など、学びたい内容のアイコンをタップ", placeholder: "学習内容アイコン行の画像" },
          { icon: "▶️", title: "学習方法のアイコンから探す", desc: "ドリル・カード・ゲームなど、使いたい方法のアイコンをタップ", placeholder: "学習方法アイコン行の画像" },
          { icon: "✦", title: "「教材一覧を見る」から探す", desc: "内容と方法を組み合わせて絞り込みができます", placeholder: "教材一覧モーダルの画像" },
        ].map((item) => (
          <div key={item.title} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{item.title}</span>
            </div>
            <div style={{ fontSize: 12, color: "#999", lineHeight: 1.7, marginBottom: 10 }}>{item.desc}</div>
            {/* プレースホルダー */}
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>{item.placeholder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ダウンロード・印刷 */}
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 16 }}>ダウンロード・印刷する</div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {[
          { icon: "printer" as const, text: "PDFをダウンロードして、A4用紙に印刷するだけ。カラーでも白黒でも使えます。" },
          { icon: "scissors" as const, text: "カード系教材は印刷後、ハサミで切り取ってご使用ください。" },
        ].map((item) => (
          <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 10 }}>
            <BrandIcon name={item.icon} size={18} color="#c9a0f0" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>

  </div>
)}
        {guideTab === "find" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>教材の探し方</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>

      {/* ① 学習内容から探す */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>01</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>学習内容から探す</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>トップページの学習内容アイコンをタップすると、教材一覧が開き該当の内容の教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>学習内容アイコン行の画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ② 学習方法から探す */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>02</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>学習方法から探す</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>トップページの学習方法アイコンをタップすると、教材一覧が開き該当の方法の教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>学習方法アイコン行の画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ③ 2つを組み合わせて絞り込む */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>03</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>2つを組み合わせて絞り込む</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 8 }}>教材一覧では左の縦タブ（内容）と上の横タブ（方法）を組み合わせて絞り込めます。</div>
            <div style={{ fontSize: 12, color: "#c9a0f0", fontWeight: 700, marginBottom: 16 }}>例：「ひらがな × ゲーム」→ ひらがなのゲーム教材だけ表示</div>
            <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>教材一覧の縦タブ・横タブの画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ④ キーワードで検索する */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>04</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>キーワードで検索する</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>教材一覧上部の検索バーにキーワードを入力すると、関連する教材が表示されます。</div>
            <div style={{ width: "100%", aspectRatio: "16/5", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>検索バーの画像</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", fontSize: 16, color: "#ddd" }}>↓</div>

      {/* ⑤ 教材の詳細を確認する */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>05</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4 }}>教材の詳細を確認する</div>
            <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 16 }}>教材をタップするとプレビューと使い方が確認できます。気に入ったらそのままダウンロードできます。</div>
            <div style={{ width: "100%", aspectRatio: "16/9", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
              <span>🖼</span><span>教材詳細（ティザーモーダル）の画像</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
)}
       
        {guideTab === "more" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>もっと活用したい</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>

      {/* ① ダウンロード履歴 */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <BrandIcon name="folder" size={20} color="#c9a0f0" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>ダウンロード履歴を活用する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>過去にダウンロードした教材はサイドバーの「ダウンロード履歴」からすぐ再ダウンロードできます。</div>
        <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>サイドバーのダウンロード履歴の画像</span>
        </div>
      </div>

      {/* ② お気に入り */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <BrandIcon name="heart" size={20} color="#c9a0f0" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>お気に入りリストを整理する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>ハートボタンで保存した教材はサイドバーの「お気に入り」から確認できます。学習テーマや季節ごとにまとめておくと、授業・学習の計画が立てやすくなります。</div>
        <div style={{ width: "100%", aspectRatio: "16/6", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>お気に入り画面の画像</span>
        </div>
      </div>

      {/* ③ サブスク教材の確認 */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <BrandIcon name="plan" size={20} color="#c9a0f0" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>サブスク教材を確認する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 14 }}>教材一覧では、使えるプランがタグで色分けして表示されています。自分のプランで使える教材がひと目でわかります。</div>
        <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>教材一覧のタグ表示の画像</span>
        </div>
      </div>

      {/* ④ トップページのタブ */}
      <div style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
          <BrandIcon name="sparkle" size={20} color="#c9a0f0" />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>トップページのタブを活用する</span>
        </div>
        <div style={{ fontSize: 13, color: "#777", lineHeight: 1.8, marginBottom: 10 }}>ピックアップ・おすすめ・ランキング・新着の4つのタブから教材を探せます。ログインしていなくても、登録していなくても見られます。</div>
        <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.7, marginBottom: 14 }}>※ダウンロードは教材によって異なります。</div>
        <div style={{ width: "100%", aspectRatio: "16/7", background: "#f0f0f0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#bbb", fontSize: 11 }}>
          <span>🖼</span><span>トップページのタブの画像</span>
        </div>
      </div>

    </div>
  </div>
)}
{guideTab === "help" && (
  <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

    <div style={{ fontSize: 16, fontWeight: 800, color: "#333", marginBottom: 4 }}>使っていてわからないとき</div>

    <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
      {[
        {
          q: "ダウンロードボタンが押せない",
          a: "サブスク教材の場合、対応するプランへの登録が必要です。教材のタグを確認してください。",
        },
        {
          q: "ログインできない",
          a: "パスワードをお忘れの場合はログイン画面の「パスワードを忘れた方」から再設定できます。",
        },
        {
          q: "お気に入りが保存されない",
          a: "お気に入り機能はログインが必要です。サイドバーからログインしてください。",
        },
        {
          q: "PDFが開けない・印刷できない",
          a: "PDFビューワー（Adobe Acrobatなど）をインストールしてお試しください。",
        },
        {
          q: "教材のリクエストをしたい",
          a: "画面右下のチャットボタンからリクエストを送ることができます。",
        },
      ].map((item) => (
        <div key={item.q} style={{ background: "white", border: "0.5px solid rgba(200,170,240,0.2)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "0.5px solid rgba(200,170,240,0.15)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#e49bfd", flexShrink: 0 }}>Q</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#333", lineHeight: 1.7 }}>{item.q}</span>
          </div>
          <div style={{ padding: "14px 18px", background: "#fafafa", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#a3c0ff", flexShrink: 0 }}>A</span>
            <span style={{ fontSize: 13, color: "#666", lineHeight: 1.8 }}>{item.a}</span>
          </div>
        </div>
      ))}
    </div>

    {/* 解決しない場合 */}
    <div style={{ background: "linear-gradient(135deg,rgba(244,185,185,0.08),rgba(228,155,253,0.08))", border: "0.5px solid rgba(200,170,240,0.3)", borderRadius: 14, padding: "24px 28px", textAlign: "center" as const }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginBottom: 6 }}>解決しませんでしたか？</div>
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16, lineHeight: 1.7 }}>お気軽にお問い合わせください。通常2〜3営業日以内にご返信します。</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <button onClick={() => window.location.href = "/faq"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, border: "0.5px solid rgba(163,192,255,0.6)", background: "white", color: "#7a50b0", cursor: "pointer", fontWeight: 600 }}>よくある質問を見る</button>
        <button onClick={() => window.location.href = "/contact"} style={{ fontSize: 12, padding: "9px 24px", borderRadius: 20, background: "linear-gradient(135deg,#f4b9b9,#e49bfd)", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>お問い合わせする →</button>
      </div>
    </div>

  </div>
)}
       
      </div>
    </div>
  );
}
export { TroubleSection, GuideSection };