import type { ReactElement, ReactNode } from "react";

import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Zen_Kaku_Gothic_New } from "next/font/google";
import "../styles/globals.css";

/*
 * 画面見出し・日付数字・ロゴ用のセリフ体。英字のみ。
 * 縦画が太く横画が極細の、ファッション誌の見出しの系統。
 */
const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  weight: ["500", "600"],
  subsets: ["latin"],
  display: "swap",
});

/*
 * 日本語本文用。CJKはファイルが巨大なので preload せず、
 * unicode-range で必要な字形だけ遅延ダウンロードさせる。
 */
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku",
  weight: ["400", "500", "700"],
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
      className={`${bodoniModa.variable} ${zenKakuGothicNew.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
