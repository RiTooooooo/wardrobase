"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/SignOutButton";

import styles from "./AppHeader.module.css";
import { isCurrent, NAV_ITEMS } from "./navItems";

/**
 * ページ先頭では背景に溶け込み、スクロールしたときだけ
 * すりガラスと細い区切り線が現れる（内容が下を通る間だけ「棚板」になる）。
 */
function useScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return (): void => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

export function AppHeader(): ReactElement {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const innerClass = isFullWidthPath(pathname)
    ? `${styles.inner} ${styles.innerWide}`
    : styles.inner;
  const headerClass = scrolled
    ? `${styles.header} ${styles.headerScrolled}`
    : styles.header;

  return (
    <header className={headerClass}>
      <div className={innerClass}>
        <Link className={styles.logo} href="/wardrobe">
          wardro<span className={styles.logoAccent}>base</span>
        </Link>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isCurrent(pathname, item)}
            />
          ))}
        </nav>
        <div className={styles.trailing}>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}): ReactElement {
  const className = isActive
    ? `${styles.navLink} ${styles.navLinkActive}`
    : styles.navLink;

  return (
    <Link
      className={className}
      href={href}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

/** ボードは全幅レイアウトなので、ヘッダーも中央寄せせず端まで使う */
function isFullWidthPath(pathname: string): boolean {
  return pathname.startsWith("/stylings/board") || pathname.endsWith("/board");
}
