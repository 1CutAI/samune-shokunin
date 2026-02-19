import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "サムネ職人 | AIがYouTubeサムネイルを自動生成",
  description:
    "動画タイトルを入力してスタイルを選ぶだけ。AIがクリック率の高いYouTubeサムネイルを瞬時に生成します。",
  openGraph: {
    title: "サムネ職人 | AIがYouTubeサムネイルを自動生成",
    description:
      "動画タイトルを入力するだけ。AIがプロ品質のサムネイルを自動生成。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
