"use client";

import type { ReactElement } from "react";

import type { Season } from "@/domain/item/season";
import { SEASONS, SEASON_LABELS } from "@/domain/item/season";

import styles from "./SeasonPicker.module.css";

interface SeasonPickerProps {
  selected: readonly Season[];
  disabled?: boolean;
  onToggle: (season: Season) => void;
}

export function SeasonPicker({
  selected,
  disabled,
  onToggle,
}: SeasonPickerProps): ReactElement {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>
        季節<span className={styles.optional}>任意・複数選択可</span>
      </legend>
      <div className={styles.chips}>
        {SEASONS.map((season) => (
          <button
            key={season}
            className={
              selected.includes(season)
                ? `${styles.chip} ${styles.chipSelected}`
                : styles.chip
            }
            type="button"
            aria-pressed={selected.includes(season)}
            onClick={() => {
              onToggle(season);
            }}
          >
            {SEASON_LABELS[season]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
