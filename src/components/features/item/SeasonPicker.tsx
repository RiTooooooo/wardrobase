"use client";

import type { ReactElement } from "react";

import type { Season, SeasonGroup } from "@/domain/item/season";
import { SEASON_GROUP_MEMBERS, SEASON_GROUPS } from "@/domain/item/season";

import styles from "./SeasonPicker.module.css";

/*
 * 季節の選択。UI は SS（春夏）/ AW（秋冬）の2択で見せる。
 * 保存は従来の4値のままなので、グループの切り替えは
 * 束ねている季節をまとめてトグルすることで実現する。
 */

interface SeasonPickerProps {
  selected: readonly Season[];
  disabled?: boolean;
  onToggle: (season: Season) => void;
}

/** グループに1つでもメンバーが入っていれば選択中とみなす */
function isGroupSelected(
  selected: readonly Season[],
  group: SeasonGroup,
): boolean {
  return SEASON_GROUP_MEMBERS[group].some((season) =>
    selected.includes(season),
  );
}

/*
 * 選択中なら「入っているメンバーを外す」、未選択なら「足りないメンバーを足す」。
 * onToggle は関数型 setState 前提なので、複数回呼んでも取りこぼさない。
 */
function toggleGroup(
  selected: readonly Season[],
  group: SeasonGroup,
  onToggle: (season: Season) => void,
): void {
  const removing = isGroupSelected(selected, group);
  for (const season of SEASON_GROUP_MEMBERS[group]) {
    if (selected.includes(season) === removing) {
      onToggle(season);
    }
  }
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
        {SEASON_GROUPS.map((group) => (
          <button
            key={group}
            className={
              isGroupSelected(selected, group)
                ? `${styles.chip} ${styles.chipSelected}`
                : styles.chip
            }
            type="button"
            aria-pressed={isGroupSelected(selected, group)}
            onClick={() => {
              toggleGroup(selected, group, onToggle);
            }}
          >
            {group}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
