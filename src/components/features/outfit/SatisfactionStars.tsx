import type { ReactElement } from "react";

import { IconStar } from "@/components/ui/icons";

import styles from "./SatisfactionStars.module.css";

export const SATISFACTION_LEVELS = [1, 2, 3, 4, 5] as const;

/*
 * お気に入り度の表示。数字ではなく5つの星で示す。
 * 値ぶんは青い塗り、残りは薄い線だけの星。読み上げには数値を渡す。
 */
export function SatisfactionStars({
  value,
}: {
  value: number;
}): ReactElement {
  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={`5段階中${value}`}
    >
      {SATISFACTION_LEVELS.map((level) => (
        <span
          key={level}
          className={level <= value ? styles.starOn : styles.starOff}
        >
          <IconStar filled={level <= value} />
        </span>
      ))}
    </span>
  );
}
