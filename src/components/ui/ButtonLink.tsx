import type { ReactElement, ReactNode } from "react";

import Link from "next/link";

import styles from "./ButtonLink.module.css";
import { IconPlus } from "./icons";

/*
 * 塗りのカプセル型リンク（各ページの主作成導線）。
 * 狭い画面では FAB が同じ役割を担うため、narrowHidden で消せる。
 */
export function ButtonLink({
  href,
  children,
  narrowHidden = false,
}: {
  href: string;
  children: ReactNode;
  /** 狭い画面で隠す（FAB に導線を譲るとき true） */
  narrowHidden?: boolean;
}): ReactElement {
  const className = narrowHidden
    ? `${styles.link} ${styles.narrowHidden}`
    : styles.link;

  return (
    <Link className={className} href={href}>
      <IconPlus />
      {children}
    </Link>
  );
}
