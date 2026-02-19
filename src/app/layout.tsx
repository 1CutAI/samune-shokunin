import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { GoogleAnalytics } from "./analytics";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://samune.trimora.jp";

export const metadata: Metadata = {
  title: "サムネ職人 | AIがYouTubeサムネイルを30秒で自動生成",
  description:
    "動画タイトルを入力してスタイルを選ぶだけ。AIがクリック率の高いYouTubeサムネイルを30秒で自動生成。1日3回まで無料・登録不要。外注の1/40のコストでプロ品質。",
  metadataBase: new URL(siteUrl),
  keywords: [
    "YouTubeサムネイル",
    "サムネイル 自動生成",
    "AI サムネイル",
    "YouTube サムネ 作成",
    "サムネ職人",
    "DALL-E",
    "サムネイル 無料",
  ],
  openGraph: {
    title: "サムネ職人 | AIがYouTubeサムネイルを30秒で自動生成",
    description:
      "動画タイトルを入力するだけ。AIがプロ品質のサムネイルを自動生成。1日3回まで無料。",
    type: "website",
    url: siteUrl,
    siteName: "サムネ職人",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "サムネ職人 | AIがYouTubeサムネイルを30秒で自動生成",
    description:
      "動画タイトルを入力するだけ。AIがプロ品質のサムネイルを自動生成。1日3回まで無料。",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "サムネ職人",
              description:
                "AIがYouTubeサムネイルを30秒で自動生成するWebツール",
              url: siteUrl,
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
                description: "1日3回まで無料",
              },
              creator: {
                "@type": "Organization",
                name: "Trimora株式会社",
                url: "https://trimora.jp",
              },
            }),
          }}
        />
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
