import type { ReactElement } from "react";

import styles from "./SatisfactionPicker.module.css";

const LEVELS = [1, 2, 3, 4, 5] as const;

type Props = {
  value: number | undefined;
  disabled: boolean;
  onSelect: (value: number | undefined) => void;
};

export function SatisfactionPicker({
  value,
  disabled,
  onSelect,
}: Props): ReactElement {
  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>
        満足度<span className={styles.optional}>任意</span>
      </span>
      <div className={styles.buttons}>
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            className={
              value === level
                ? `${styles.button} ${styles.buttonSelected}`
                : styles.button
            }
            disabled={disabled}
            onClick={() => onSelect(value === level ? undefined : level)}
            aria-pressed={value === level}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
