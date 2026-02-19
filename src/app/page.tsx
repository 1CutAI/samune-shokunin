"use client";

import { useState, useRef } from "react";

type StyleOption = {
  id: string;
  name: string;
  description: string;
  color: string;
};

const styles: StyleOption[] = [
  { id: "business", name: "ビジネス", description: "企業・マーケ・副業系", color: "#1e3a5f" },
  { id: "education", name: "教育・解説", description: "ハウツー・チュートリアル", color: "#e67e22" },
  { id: "entertainment", name: "エンタメ", description: "Vlog・バラエティ系", color: "#e74c3c" },
  { id: "tech", name: "テック", description: "プログラミング・ガジェット", color: "#8e44ad" },
  { id: "lifestyle", name: "ライフスタイル", description: "暮らし・美容・健康", color: "#27ae60" },
  { id: "news", name: "ニュース", description: "時事・考察・解説", color: "#c0392b" },
];

const faqs = [
  {
    q: "生成された画像にテキストは入りますか？",
    a: "いいえ。画像のみを生成します。Canva等の無料ツールでタイトルテキストを重ねてご使用ください。テキストを重ねる方法のガイドも近日公開予定です。",
  },
  {
    q: "1枚あたりいくらかかりますか？",
    a: "無料プランは1日3枚まで無料です。有料プランではライト月30枚（¥1,480）、プロ無制限（¥2,980）をご用意しています。外注（1枚1,000〜5,000円）と比べて大幅にコストダウンできます。",
  },
  {
    q: "生成された画像の著作権は？",
    a: "生成された画像はご自由に商用利用いただけます。YouTubeサムネイル、SNS投稿、ブログのアイキャッチなどにお使いください。",
  },
  {
    q: "どのくらいの時間で生成されますか？",
    a: "通常15〜30秒で生成が完了します。最新のDALL-E 3技術を使用しているため、高品質な画像を高速に生成できます。",
  },
  {
    q: "YouTubeの推奨サイズに対応していますか？",
    a: "はい。16:9のアスペクト比（1792x1024px）で生成されます。YouTubeにアップロードすると自動的に推奨サイズ（1280x720px）にリサイズされます。",
  },
];

export default function Home() {
  const [videoTitle, setVideoTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("business");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  function scrollToTool() {
    toolRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleGenerate() {
    if (!videoTitle.trim() || videoTitle.trim().length < 3) {
      setError("動画タイトルを3文字以上で入力してください。");
      return;
    }
    setLoading(true);
    setError("");
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoTitle, style: selectedStyle, keywords }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました。");
        if (data.remaining !== undefined) setRemaining(data.remaining);
        return;
      }
      setImageUrl(data.imageUrl);
      if (data.remaining !== undefined) setRemaining(data.remaining);
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thumbnail-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("ダウンロードに失敗しました。画像を右クリックして保存してください。");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0f0f0f]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <span className="text-lg font-bold text-white">サムネ職人</span>
          </div>
          <div className="flex items-center gap-4">
            {remaining !== null && (
              <span className="text-sm text-gray-400 hidden sm:block">
                残り <span className="font-bold text-red-400">{remaining}</span>/3
              </span>
            )}
            <button
              onClick={scrollToTool}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              無料で試す
            </button>
          </div>
        </div>
      </header>

      {/* ==================== LP Section ==================== */}

      {/* Hero */}
      <section className="pt-28 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-sm text-red-400 mb-6">
            1日3回まで無料
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
            YouTubeサムネイル、<br />
            まだ<span className="text-red-500">外注</span>してますか？
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            動画タイトルを入力するだけ。AIが<strong className="text-white">30秒</strong>で
            クリック率の高いサムネイルを自動生成します。
          </p>
          <button
            onClick={scrollToTool}
            className="rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            今すぐ無料で生成する
          </button>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            サムネイル制作の<span className="text-red-400">悩み</span>、ありませんか？
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5">
              <div className="text-2xl mb-2">💸</div>
              <h3 className="font-bold text-white mb-1">外注すると高い</h3>
              <p className="text-sm text-gray-400">1枚1,000〜5,000円。月10本で1〜5万円のコスト。</p>
              <div className="mt-3 text-xs text-red-400 font-medium">→ サムネ職人なら 1枚約25円</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-bold text-white mb-1">自作は時間がかかる</h3>
              <p className="text-sm text-gray-400">Canvaで30分〜1時間。デザインに自信がない。</p>
              <div className="mt-3 text-xs text-red-400 font-medium">→ サムネ職人なら 30秒で完成</div>
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5">
              <div className="text-2xl mb-2">😞</div>
              <h3 className="font-bold text-white mb-1">クリック率が上がらない</h3>
              <p className="text-sm text-gray-400">頑張って作っても再生数が伸びない。</p>
              <div className="mt-3 text-xs text-red-400 font-medium">→ AIが最適な構図を自動設計</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-[#141414]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            たった<span className="text-red-400">3ステップ</span>で完成
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-bold text-white mb-2">動画タイトルを入力</h3>
              <p className="text-sm text-gray-400">YouTubeに投稿する動画のタイトルをそのまま入力するだけ。</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-bold text-white mb-2">スタイルを選択</h3>
              <p className="text-sm text-gray-400">ビジネス、教育、エンタメなど6つのスタイルから選択。</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-bold text-white mb-2">AIが自動生成</h3>
              <p className="text-sm text-gray-400">30秒でプロ品質のサムネイル画像が完成。すぐにダウンロード。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Tool Section ==================== */}
      <div ref={toolRef} className="scroll-mt-16" />

      <section className="py-16 px-4 border-t border-white/5" id="tool">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            サムネイルを生成する
          </h2>
          <p className="text-gray-500 text-center mb-8">1日3回まで無料でお試しいただけます</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-300 mb-1">
                    動画タイトル <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="videoTitle"
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="例: 【副業で月10万円】初心者が今すぐ始めるべき3つのこと"
                    maxLength={200}
                    className="w-full rounded-xl border border-white/20 bg-[#0f0f0f] px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-300 mb-1">
                    キーワード（任意）
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="例: お金, 成功, パソコン, 笑顔の人物"
                    maxLength={100}
                    className="w-full rounded-xl border border-white/20 bg-[#0f0f0f] px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    サムネイルに含めたい要素をカンマ区切りで
                  </p>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">スタイル</label>
                  <div className="grid grid-cols-3 gap-2">
                    {styles.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStyle(s.id)}
                        className={`rounded-xl p-3 border-2 transition-all text-left ${
                          selectedStyle === s.id
                            ? "border-red-500 bg-red-500/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="w-full h-2 rounded-full mb-2" style={{ backgroundColor: s.color }} />
                        <p className="text-xs font-medium text-white">{s.name}</p>
                        <p className="text-[10px] text-gray-500">{s.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !videoTitle.trim()}
                className="w-full mt-5 rounded-xl bg-red-600 px-6 py-3.5 text-white font-medium hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AIがサムネイルを生成中...（15〜30秒）
                  </span>
                ) : (
                  "サムネイルを生成する"
                )}
              </button>

              {error && (
                <div className="mt-3 rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-white mb-4">プレビュー</h3>
              {imageUrl ? (
                <div>
                  <div className="rounded-xl overflow-hidden border border-white/10 mb-4 aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Generated thumbnail" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownload}
                      className="flex-1 rounded-xl bg-white px-4 py-3 text-black font-medium hover:bg-gray-200 transition-colors"
                    >
                      ダウンロード (PNG)
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="rounded-xl border border-white/20 px-4 py-3 text-white font-medium hover:bg-white/5 transition-colors"
                    >
                      再生成
                    </button>
                  </div>
                  <div className="mt-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-400">
                      Canva等の画像編集ツールで動画タイトルのテキストを重ねると、さらにクリック率がアップします。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/10 text-gray-500">
                  <span className="text-4xl mb-3">🖼️</span>
                  <p className="text-sm">タイトルを入力して生成ボタンをクリック</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== Pricing ==================== */}
      <section className="py-16 px-4 bg-[#141414]" id="pricing">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white text-center mb-3">料金プラン</h2>
          <p className="text-gray-500 text-center mb-10">外注の10分の1以下のコストで、プロ品質のサムネイルを</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Free */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-gray-400 mb-1">無料プラン</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">¥0</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 1日3枚まで
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 6スタイル対応
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 高解像度ダウンロード
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 商用利用OK
                </li>
              </ul>
              <button
                onClick={scrollToTool}
                className="w-full rounded-xl border border-white/20 py-2.5 text-sm text-white font-medium hover:bg-white/5 transition-colors"
              >
                無料で始める
              </button>
            </div>

            {/* Light */}
            <div className="bg-[#1a1a1a] rounded-2xl border-2 border-red-500 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 rounded-full px-3 py-0.5 text-xs font-bold text-white">
                人気
              </div>
              <h3 className="font-bold text-white mb-1">ライトプラン</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">¥1,480</span>
                <span className="text-sm text-gray-500">/月</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 月30枚
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 全スタイル対応
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 優先生成
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 生成履歴の保存
                </li>
              </ul>
              <button className="w-full rounded-xl bg-red-600 py-2.5 text-sm text-white font-medium hover:bg-red-700 transition-colors">
                近日公開
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
              <h3 className="font-bold text-white mb-1">プロプラン</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-white">¥2,980</span>
                <span className="text-sm text-gray-500">/月</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> 無制限生成
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> A/Bバリエーション生成
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> カスタムスタイル
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span> API連携
                </li>
              </ul>
              <button className="w-full rounded-xl border border-white/20 py-2.5 text-sm text-white font-medium hover:bg-white/5 transition-colors">
                近日公開
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            1枚あたり約25〜50円。外注（1枚1,000〜5,000円）の 1/40 以下。
          </p>
        </div>
      </section>

      {/* ==================== Comparison ==================== */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white text-center mb-10">他の方法との比較</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-500 font-medium"></th>
                  <th className="text-center py-3 text-red-400 font-bold">サムネ職人</th>
                  <th className="text-center py-3 text-gray-400 font-medium">デザイナー外注</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Canva自作</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-gray-300">コスト/枚</td>
                  <td className="py-3 text-center text-red-400 font-bold">約¥25〜50</td>
                  <td className="py-3 text-center">¥1,000〜5,000</td>
                  <td className="py-3 text-center">¥0（時間コスト大）</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-gray-300">制作時間</td>
                  <td className="py-3 text-center text-red-400 font-bold">30秒</td>
                  <td className="py-3 text-center">1〜3日</td>
                  <td className="py-3 text-center">30分〜1時間</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-gray-300">デザインスキル</td>
                  <td className="py-3 text-center text-red-400 font-bold">不要</td>
                  <td className="py-3 text-center">不要</td>
                  <td className="py-3 text-center">必要</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 font-medium text-gray-300">バリエーション</td>
                  <td className="py-3 text-center text-red-400 font-bold">何度でも再生成</td>
                  <td className="py-3 text-center">修正は追加料金</td>
                  <td className="py-3 text-center">作り直し</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section className="py-16 px-4 bg-[#141414]" id="faq">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white text-center mb-10">よくある質問</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between"
                >
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  <span className="text-gray-500 flex-shrink-0 ml-4">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            サムネイル制作を、<span className="text-red-500">もっと速く。</span>
          </h2>
          <p className="text-gray-400 mb-8">
            登録不要、1日3回まで無料。まずは1枚試してみてください。
          </p>
          <button
            onClick={scrollToTool}
            className="rounded-xl bg-red-600 px-8 py-4 text-lg font-bold text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            無料でサムネイルを生成する
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎬</span>
            <span className="text-sm font-bold text-gray-400">サムネ職人</span>
          </div>
          <p className="text-xs text-gray-600">
            Powered by Trimora株式会社 | AI動画おまかせ便
          </p>
        </div>
      </footer>
    </div>
  );
}
