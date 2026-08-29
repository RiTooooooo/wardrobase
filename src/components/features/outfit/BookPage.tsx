import type { CSSProperties, ReactElement } from "react";

import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";
import { OutfitCard } from "./OutfitCard";

/*
 * 本の1ページ。日付グループを縦に並べる。空のときは白紙のページになる。
 *
 * variant で日付の見せ方が変わる:
 * - spread: 見開きの本。日本語の日付ラベル（既定）
 * - notebook: スマホのリングノート。英字の月・大きな日・曜日で組む
 */
type Variant = "spread" | "notebook";

export function BookPage({
  groups,
  variant = "spread",
}: {
  groups: DateGroup[];
  variant?: Variant;
}): ReactElement {
  const className =
    variant === "notebook"
      ? `${styles.pageContent} ${styles.notebook}`
      : styles.pageContent;

  return (
    <div className={className}>
      {groups.map((group, index) => (
        <div
          key={group.label}
          className={styles.dateGroup}
          style={{ "--index": index } as CSSProperties}
        >
          {variant === "notebook" ? (
            <NotebookDate date={group.date} />
          ) : (
            <span className={styles.dateLabel}>{group.label}</span>
          )}
          {group.entries.map((entry) => (
            <OutfitCard key={entry.id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ノート用の日付見出し。手帳の日付スタンプのように組む */
function NotebookDate({ date }: { date: string }): ReactElement {
  const d = new Date(`${date}T00:00:00`);
  const month = d
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const day = String(d.getDate()).padStart(2, "0");

  return (
    <div className={styles.nbHead}>
      <span className={styles.nbMonth}>{month}</span>
      <span className={styles.nbRow}>
        <span className={styles.nbDay}>{day}</span>
        <span className={styles.nbSide}>
          <span className={styles.nbWeekday}>{weekday}</span>
          <span className={styles.nbYear}>{d.getFullYear()}</span>
        </span>
      </span>
    </div>
  );
}
