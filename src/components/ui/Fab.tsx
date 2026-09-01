import type { ReactElement } from "react";

import Link from "next/link";

import styles from "./Fab.module.css";
import { IconPlus } from "./icons";

/*
 * 狭い画面専用の作成ボタン（フローティングアクションボタン）。
 * 広い画面では見出し右の ButtonLink が同じ導線を担うため出さない。
 */
export function Fab({
  href,
  label,
}: {
  href: string;
  /** 動作の説明。アイコンだけのボタンなので必須 */
  label: string;
}): ReactElement {
  return (
    <Link className={styles.fab} href={href} aria-label={label}>
      <IconPlus size={24} />
    </Link>
  );
}
