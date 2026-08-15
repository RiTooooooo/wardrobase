import type { ReactElement, ReactNode } from "react";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * 日本語本文用。CJKはファイルが巨大なので preload せず、
 * unicode-range で必要な字形だけ遅延ダウンロードさせる。
 */
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Wardrobase",
    template: "%s | Wardrobase",
  },
  description:
    "自分の好きなスタイリングを、蓄積して使い回すためのワードローブ基盤",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactElement {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
