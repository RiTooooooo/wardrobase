import type { ReactElement, ReactNode } from "react";

import styles from "./PageTitle.module.css";

/*
 * 一覧ページ共通の見出し。
 * セリフ体の英語見出し＋日本語の補足（件数など）を左に、操作を右に置く。
 * 英語が許されるのはこの見出しだけ（他は日本語ファースト）。
 */
export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}): ReactElement {
  return (
    <header className={styles.row}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {actions !== undefined ? (
        <div className={styles.actions}>{actions}</div>
      ) : null}
    </header>
  );
}
