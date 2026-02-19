"use client";

import { useState } from "react";

type StyleOption = {
  id: string;
  name: string;
  description: string;
  color: string;
};

const styles: StyleOption[] = [
  {
    id: "business",
    name: "ビジネス",
    description: "企業・マーケ・副業系",
    color: "#1e3a5f",
  },
  {
    id: "education",
    name: "教育・解説",
    description: "ハウツー・チュートリアル",
    color: "#e67e22",
  },
  {
    id: "entertainment",
    name: "エンタメ",
    description: "Vlog・バラエティ系",
    color: "#e74c3c",
  },
  {
    id: "tech",
    name: "テック",
    description: "プログラミング・ガジェット",
    color: "#8e44ad",
  },
  {
    id: "lifestyle",
    name: "ライフスタイル",
    description: "暮らし・美容・健康",
    color: "#27ae60",
  },
  {
    id: "news",
    name: "ニュース",
    description: "時事・考察・解説",
    color: "#c0392b",
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
        body: JSON.stringify({
          videoTitle,
          style: selectedStyle,
          keywords,
        }),
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
      <header className="border-b border-white/10 bg-[#0f0f0f]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h1 className="text-xl font-bold text-white">サムネ職人</h1>
          </div>
          {remaining !== null && (
            <span className="text-sm text-gray-400">
              本日の残り回数:{" "}
              <span className="font-bold text-red-400">{remaining}</span>/3
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <section className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            AIがYouTubeサムネイルを
            <span className="text-red-500">自動生成</span>
          </h2>
          <p className="text-gray-400 text-lg">
            動画タイトルを入力してスタイルを選ぶだけ。クリック率の高いサムネイルを瞬時に。
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <section className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold text-white mb-4">サムネイルを設定</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="videoTitle"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
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
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  スタイル
                </label>
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
                      <div
                        className="w-full h-2 rounded-full mb-2"
                        style={{ backgroundColor: s.color }}
                      />
                      <p className="text-xs font-medium text-white">
                        {s.name}
                      </p>
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
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
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

            <p className="mt-3 text-xs text-gray-500 text-center">
              DALL-E 3による高品質画像生成。1回の生成で約¥6〜8のAPI費用が発生します。
            </p>
          </section>

          {/* Preview Panel */}
          <section className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6">
            <h3 className="font-bold text-white mb-4">プレビュー</h3>

            {imageUrl ? (
              <div>
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Generated thumbnail"
                    className="w-full h-full object-cover"
                  />
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
                <p className="mt-3 text-xs text-gray-500">
                  生成画像は1792x1024px。YouTubeにアップロード時に自動で1280x720にリサイズされます。
                </p>
                <div className="mt-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-yellow-300/80">
                    テキストは含まれていません。Canva等の画像編集ツールで動画タイトルを重ねてご使用ください。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-white/10 text-gray-500">
                <span className="text-4xl mb-3">🖼️</span>
                <p className="text-sm">
                  動画タイトルを入力して「サムネイルを生成する」をクリック
                </p>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                クリック率を上げるコツ
              </h4>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>
                  - サムネイル画像の上にCanva等で大きなテキストを重ねる
                </li>
                <li>- 人物の表情が入ると注目度が上がる（キーワードに追加）</li>
                <li>- コントラストの高い色使いで小さくても目立つ画像に</li>
                <li>- 動画内容が一目でわかるビジュアルを心がける</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-bold text-white mb-1">DALL-E 3品質</h3>
            <p className="text-sm text-gray-500">
              最新のAI画像生成技術でプロ品質のサムネイルを生成
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-bold text-white mb-1">6スタイル</h3>
            <p className="text-sm text-gray-500">
              ビジネス・教育・エンタメ・テック・ライフスタイル・ニュース
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-5 text-center">
            <div className="text-3xl mb-2">📐</div>
            <h3 className="font-bold text-white mb-1">YouTube最適サイズ</h3>
            <p className="text-sm text-gray-500">
              16:9のYouTube推奨サイズで生成。そのままアップ可能
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-gray-600">
          <p>サムネ職人 — Powered by Trimora株式会社</p>
          <p className="mt-1">1日3回まで無料でご利用いただけます</p>
        </div>
      </footer>
    </div>
  );
}
