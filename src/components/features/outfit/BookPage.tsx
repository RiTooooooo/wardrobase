import type { CSSProperties, ReactElement } from "react";

import type { DateGroup } from "./lookbookTypes";
import styles from "./OutfitBook.module.css";
import { OutfitCard } from "./OutfitCard";

/* 本の1ページ。日付グループを縦に並べる。空のときは白紙のページになる */
export function BookPage({ groups }: { groups: DateGroup[] }): ReactElement {
  return (
    <div className={styles.pageContent}>
      {groups.map((group, index) => (
        <div
          key={group.label}
          className={styles.dateGroup}
          style={{ "--index": index } as CSSProperties}
        >
          <span className={styles.dateLabel}>{group.label}</span>
          {group.entries.map((entry) => (
            <OutfitCard key={entry.id} entry={entry} />
          ))}
        </div>
      ))}
    </div>
  );
}
