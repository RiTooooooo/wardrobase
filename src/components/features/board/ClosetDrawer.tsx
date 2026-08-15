"use client";

import { useMemo, useState } from "react";
import type { PointerEvent, ReactElement } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/domain/item/category";
import type { Category } from "@/domain/item/category";

import type { DrawerItem } from "./boardTypes";
import styles from "./ClosetDrawer.module.css";
import { DrawerCategory } from "./DrawerCategory";

/*
 * カテゴリを「引き出し」に見立てたクローゼット。
 *
 * ログイン画面と同じ線画の語彙（細い青線）で家具として描き、
 * 引き出しを開けて中のアイテムを掴む、という物理的な操作に寄せている。
 *
 * 実際の引き出しと同じく同時に開くのは1つだけ。
 * 開いた引き出しに縦の領域を集中させたいという実利もある。
 */

type Props = {
  items: DrawerItem[];
  placedIds: string[];
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
  /** 指定するとドラッグではなくタップで配置する（狭い画面向け） */
  onPick?: (item: DrawerItem) => void;
};

export function ClosetDrawer({
  items,
  placedIds,
  onDragStart,
  onPick,
}: Props): ReactElement {
  const [openCat, setOpenCat] = useState<Category | null>("TOPS");

  const grouped = useMemo(() => groupByCategory(items), [items]);

  function toggleCategory(cat: Category): void {
    setOpenCat((prev) => (prev === cat ? null : cat));
  }

  return (
    <div className={styles.closet}>
      <div className={styles.cornice} aria-hidden="true" />
      <div className={styles.carcass}>
        <p className={styles.title}>クローゼット</p>
        <div className={styles.drawers}>
          {CATEGORIES.map((cat) => (
            <Drawer
              key={cat}
              category={cat}
              count={(grouped[cat] ?? []).length}
              isOpen={openCat === cat}
              onToggle={toggleCategory}
            >
              <DrawerCategory
                items={grouped[cat] ?? []}
                placedIds={placedIds}
                onDragStart={onDragStart}
                onPick={onPick}
              />
            </Drawer>
          ))}
        </div>
      </div>
      <div className={styles.plinth} aria-hidden="true" />
    </div>
  );
}

function Drawer({
  category,
  count,
  isOpen,
  onToggle,
  children,
}: {
  category: Category;
  count: number;
  isOpen: boolean;
  onToggle: (cat: Category) => void;
  children: ReactElement;
}): ReactElement {
  const className = isOpen
    ? `${styles.drawer} ${styles.drawerOpen}`
    : styles.drawer;

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.front}
        onClick={() => onToggle(category)}
        aria-expanded={isOpen}
      >
        {/* 引き出しの取っ手。家具に見せるための造形 */}
        <span className={styles.pull} aria-hidden="true" />
        <span className={styles.label}>{CATEGORY_LABELS[category]}</span>
        <span className={styles.count}>{count}</span>
      </button>
      {/*
        開閉をアニメーションさせるため、閉じていても描画したまま高さを潰す。
        閉じた引き出しの中身をキーボードで掴めてしまわないよう inert にする。
      */}
      <div className={styles.interior} inert={!isOpen}>
        <div className={styles.interiorInner}>{children}</div>
      </div>
    </div>
  );
}

function groupByCategory(
  items: DrawerItem[],
): Partial<Record<Category, DrawerItem[]>> {
  const groups: Partial<Record<Category, DrawerItem[]>> = {};

  for (const item of items) {
    const list = groups[item.category] ?? [];
    list.push(item);
    groups[item.category] = list;
  }

  return groups;
}
