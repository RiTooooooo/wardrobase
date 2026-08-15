"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./BottomNav.module.css";
import { isCurrent, NAV_ITEMS } from "./navItems";

/*
 * 狭い画面用のナビゲーション。
 *
 * 行き先が3つしかないので、隠さずすべて並べる。
 * 画面下部に置くのは、上端より親指が届きやすいため。
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
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
