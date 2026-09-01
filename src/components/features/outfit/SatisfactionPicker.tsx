import type { ReactElement } from "react";

import { IconStar } from "@/components/ui/icons";

import { SATISFACTION_LEVELS } from "./SatisfactionStars";
import styles from "./SatisfactionPicker.module.css";

type Props = {
  value: number | undefined;
  disabled: boolean;
  onSelect: (value: number | undefined) => void;
};

/*
 * お気に入り度の入力。数字ではなく星5つで選ぶ。
 * 選んだ段階までが青く塗られ、同じ星をもう一度押すと未記入に戻る。
 */
export function SatisfactionPicker({
  value,
  disabled,
  onSelect,
}: Props): ReactElement {
  const current = value ?? 0;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        お気に入り度<span className={styles.optional}>任意</span>
      </span>
      <div className={styles.buttons}>
        {SATISFACTION_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            className={
              level <= current
                ? `${styles.star} ${styles.starOn}`
                : styles.star
            }
            disabled={disabled}
            onClick={() => onSelect(value === level ? undefined : level)}
            aria-pressed={value === level}
            aria-label={`お気に入り度 ${level}`}
          >
            <IconStar size={24} filled={level <= current} />
          </button>
        ))}
      </div>
    </div>
  );
}
