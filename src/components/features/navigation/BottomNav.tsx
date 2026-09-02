"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./BottomNav.module.css";
import { isCurrent, NAV_ITEMS } from "./navItems";
import { markSectionNav } from "./sectionNav";

/*
 * 狭い画面用のナビゲーション。
 *
 * 行き先が3つしかないので、隠さずすべて並べる。
 * 画面下部に置くのは、上端より親指が届きやすいため。
 * 現在地はラベル下の青いドットで示す（ヘッダーのナビと同じ語彙）。
 * 広い画面ではヘッダー内にナビが出るので、CSS 側で非表示にする。
 */
export function BottomNav(): ReactElement {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="メインナビゲーション">
      {NAV_ITEMS.map((item) => {
        const active = isCurrent(pathname, item);

        return (
          <Link
            key={item.href}
            className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => markSectionNav(pathname, item.href)}
          >
            <TabIcon href={item.href} />
            <span>{item.label}</span>
            <span className={styles.dot} aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}

/* タブの絵柄。ラベルと対で使う機能的なアイコン（装飾ではない） */
function TabIcon({ href }: { href: string }): ReactElement {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[href] ?? ICON_PATHS["/wardrobe"]}
    </svg>
  );
}

/* クローゼット（観音扉）／ハンガー／記録帳 */
const ICON_PATHS: Record<string, ReactElement> = {
  "/wardrobe": (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M12 3 L12 21" />
      <path d="M9.5 11 L9.5 13.5" />
      <path d="M14.5 11 L14.5 13.5" />
    </>
  ),
  "/stylings": (
    <path d="M12 4 a2.4 2.4 0 1 1 2.4 2.4 C13.2 6.8 12 7.5 12 9.2 L3.8 16.6 A1.2 1.2 0 0 0 4.6 18.7 L19.4 18.7 A1.2 1.2 0 0 0 20.2 16.6 L12 9.2" />
  ),
  "/outfits": (
    <>
      <rect x="6" y="3" width="13" height="18" rx="2" />
      <path d="M6 7.5 L4 7.5" />
      <path d="M6 12 L4 12" />
      <path d="M6 16.5 L4 16.5" />
    </>
  ),
};
