"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/SignOutButton";

import styles from "./AppHeader.module.css";
import { isCurrent, NAV_ITEMS } from "./navItems";

export function AppHeader(): ReactElement {
  const pathname = usePathname();
  const innerClass = isFullWidthPath(pathname)
    ? `${styles.inner} ${styles.innerWide}`
    : styles.inner;

  return (
    <header className={styles.header}>
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
