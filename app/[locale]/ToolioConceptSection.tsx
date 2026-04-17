import { BrandIcon } from "../../components/BrandIcon";
type BIconName = Parameters<typeof BrandIcon>[0]["name"];

export default function ToolioConceptSection() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12 font-sans text-foreground">

      {/* リード文 */}
      <p className="text-base leading-loose mb-8">
        子供に日本語を教える時、どんなやり方が思いつきますか？
      </p>

      {/* 実体験ブロック */}
      <div className="bg-muted rounded-2xl px-7 py-6 mb-8">
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          子供の日本語教師として日本語を教えている中で、こんな経験がよくありました。
        </p>

        <div className="flex flex-col gap-4">
          {[
            {
              icon: "note" as BIconName,
              title: "ひらがな50音表を書く",
              result: "子供が楽しんでやっているように見えない、なんだか緊張感がある…",
              highlight: false,
            },
            {
              icon: "note" as BIconName,
              title: "語彙や文の練習問題を重ねる",
              result:
                "プリントを出すと嫌がる、意外とすぐに終わってしまうので時間が余る、だけど準備が意外と大変",
              highlight: false,
            },
            {
              icon: "note" as BIconName,
              title: "大人向けの日本語教材を使う",
              result: "場面や文法が難しくて続かない",
              highlight: false,
            },
            {
              icon: "search" as BIconName,
              title: "アニメ・漫画を見る",
              result:
                "話していることや書いてあることが難しくて、日本語の勉強になっているのか？と不安になることもある",
              highlight: false,
            },
            {
              icon: "books" as BIconName,
              title: "子ども向けの教科書を使う",
              result: "教科書を出すと、途端に嫌がる",
              highlight: false,
            },
            {
              icon: "card" as BIconName,
              title: "かるたをやる",
              result: "毎回楽しそう！",
              highlight: true,
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start text-sm leading-relaxed">
              <BrandIcon name={item.icon} size={16} color="#c9a0f0" style={{ marginTop: 2 }} />
              <div>
                <span className="font-medium">{item.title}</span>
                <span
                  className={item.highlight ? "font-medium" : "text-muted-foreground"}
                  style={item.highlight ? { color: "#e49bfd" } : {}}
                >
                  {" "}→ {item.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* まとめ文 */}
      <p className="text-sm leading-loose mb-8">
        日本語を教えてきたみなさんも、こんな経験、あるのではないでしょうか。そして結局、毎回これでいいのか…またゲームで終わってしまった…となる。
      </p>

      {/* でも強調ブロック */}
      <div
        className="rounded-r-xl py-5 px-6 mb-8 bg-muted"
        style={{ borderLeft: "3px solid #f4b9b9" }}
      >
        <p className="font-medium mb-2">でも——</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ゲームや楽しい活動を準備しようとすると、教材を作るのに時間がかかる。当日までに間に合わない。結局プリントや教科書に戻ってしまう…。
        </p>
      </div>

      {/* ブリッジ文 */}
      <p className="text-sm leading-loose mb-10">
        でも、子供たちは、楽しんでいる時ほど、自然に言葉を覚えていました。かるたで遊びながら、気づいたら単語を言えるようになっていた。ゲームに夢中になりながら、気づいたら文が出てきた。「勉強した」という感覚がないまま、できることが増えていく。そして楽しい活動の中で、ちゃんと日本語を吸収していました。それに気づいた時、toolioのアイデアが生まれました。
      </p>

      {/* ループ図 */}
      <svg
        viewBox="0 0 500 520"
        className="w-full max-w-sm mx-auto block mb-10"
        role="img"
        aria-label="toolioの学びのループ図"
      >
        <defs>
          <marker
            id="arr-loop"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Step 1 楽しい活動 */}
        <rect x="80" y="20" width="300" height="62" rx="14" fill="#fce4f8" stroke="#e49bfd" strokeWidth="1" />
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="51" textAnchor="middle" dominantBaseline="central" fill="#7a2e7a">楽しい活動</text>
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="69" textAnchor="middle" dominantBaseline="central" fill="#9e4a9e">かるた・ゲーム・ロールプレイ</text>

        <line x1="230" y1="83" x2="230" y2="114" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-loop)" />

        {/* Step 2 気づいたら触れてる */}
        <rect x="80" y="116" width="300" height="62" rx="14" fill="#ddeeff" stroke="#a3c0ff" strokeWidth="1" />
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="140" textAnchor="middle" dominantBaseline="central" fill="#1a4a8a">気づいたら日本語に触れてる</text>
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="162" textAnchor="middle" dominantBaseline="central" fill="#2a5aa0">先生がさりげなく言葉を添える</text>

        <line x1="230" y1="179" x2="230" y2="210" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-loop)" />

        {/* Step 3 あれ、できた！ */}
        <rect x="80" y="212" width="300" height="62" rx="14" fill="#ede8ff" stroke="#b89aff" strokeWidth="1" />
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="236" textAnchor="middle" dominantBaseline="central" fill="#3d1f8a">あれ、できた！</text>
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="258" textAnchor="middle" dominantBaseline="central" fill="#5530a0">小さな「できた！」を積み重ねる</text>

        <line x1="230" y1="275" x2="230" y2="306" stroke="#a3c0ff" strokeWidth="1.5" markerEnd="url(#arr-loop)" />

        {/* Step 4 またやりたい！ */}
        <rect x="80" y="308" width="300" height="62" rx="14" fill="#d6f5ee" stroke="#6dcfb8" strokeWidth="1" />
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="15" fontWeight="500" x="230" y="332" textAnchor="middle" dominantBaseline="central" fill="#0d5c4a">またやりたい！</text>
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="354" textAnchor="middle" dominantBaseline="central" fill="#1a7a64">やらされ感ゼロ・自分から動く</text>

        {/* ループ矢印（右側） */}
        <path
          d="M380 339 Q450 339 450 196 Q450 51 380 51"
          fill="none"
          stroke="#f4b9b9"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          markerEnd="url(#arr-loop)"
        />
        <text
          fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif"
          fontSize="11"
          x="466"
          y="200"
          textAnchor="middle"
          fill="#c07070"
          transform="rotate(90,466,200)"
        >
          くり返す
        </text>

        {/* 下向き矢印 */}
        <line x1="230" y1="371" x2="230" y2="418" stroke="#f4b9b9" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arr-loop)" />

        {/* 気づいたらできてた */}
        <rect x="55" y="420" width="350" height="76" rx="16" fill="#fff7e6" stroke="#f4b9b9" strokeWidth="1.5" strokeDasharray="6 3" />
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="16" fontWeight="500" x="230" y="452" textAnchor="middle" dominantBaseline="central" fill="#8a4a20">気づいたらできてた！</text>
        <text fontFamily="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" fontSize="12" x="230" y="476" textAnchor="middle" dominantBaseline="central" fill="#a05a30">大きな「できた！」へ</text>
      </svg>

      {/* toolioの核心ブロック */}
      <div
        className="rounded-2xl px-8 py-7"
        style={{
          border: "1.5px solid #e49bfd",
          background: "linear-gradient(135deg, #fdf6ff 0%, #f0f6ff 100%)",
        }}
      >
        <p className="text-base leading-loose mb-4">
          toolioは、そのギャップを埋めたくて生まれました。
        </p>
        <p className="text-sm leading-loose text-muted-foreground mb-4">
          先生や保護者のみなさんが、教材づくりに追われることなく、子どもと向き合う時間を大切にできるように。ダウンロードしてすぐ使える教材を届けることで、準備の負担を少しでも減らしたい。
        </p>
        <p className="text-sm leading-loose text-muted-foreground">
          そして何より、子どもたちに「あれ、楽しい」と感じてほしい。気づいたら言葉が出てきた、気づいたら読めるようになっていた——そんな「気づいたらできてた」の積み重ねが、子どもの自信になると信じています。だから、toolioの教材はすべて、まず楽しい活動があります。説明は最小限。難しさは気づかないうちに少しずつ上がっていく。それがtoolioです。
        </p>
      </div>

    </section>
  )
}