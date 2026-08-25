"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/domain/item/category";
import type { Category } from "@/domain/item/category";

import { filterAndSort } from "./wardrobeFilter";
import { Drawer } from "./WardrobeDrawer";
import { WardrobeFilters } from "./WardrobeFilters";
import styles from "./WardrobeCloset.module.css";
import type { WardrobeFilters as Filters, WardrobeItem } from "./wardrobeTypes";

/*
 * ワードローブを「クローゼットの引き出し」として見せる。
 *
 * 青い塗りの家具にカテゴリごとの引き出しが並び、開けると中の服が見える。
 * 最上段は「すべて」の段で、全アイテムを横に滑らせて眺められる。
 * カテゴリの絞り込みは引き出しそのものが担うため、
 * フィルタには季節・検索・並び替えだけを出す。
 *
 * 実際の引き出しと同じく、同時に開くのは1つだけ。
 */

type Props = {
  items: WardrobeItem[];
  /** フィルタ行の先頭に置く操作（「アイテムを追加」リンク）。1列にまとめるため */
  addAction?: ReactNode;
};

/** 引き出しの識別子。カテゴリに加えて最上段の「すべて」を持つ */
type DrawerKey = Category | "ALL";

const DEFAULT_FILTERS: Filters = {
  category: null,
  color: null,
  season: null,
  query: "",
  sort: "createdAt-desc",
};

export function WardrobeCloset({ items, addAction }: Props): ReactElement {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  /* 初期状態は全段閉じる。実際のクローゼットと同じく、自分の手で開ける */
  const [openKey, setOpenKey] = useState<DrawerKey | null>(null);
  const filtered = useMemo(
    () => filterAndSort(items, filters),
    [items, filters],
  );
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  function toggleDrawer(key: DrawerKey): void {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <>
      <WardrobeFilters
        filters={filters}
        onChange={setFilters}
        addAction={addAction}
      />
      <div className={styles.closet}>
        <div className={styles.cornice} aria-hidden="true" />
        <div className={styles.carcass}>
          <Drawer
            label="All"
            items={filtered}
            isOpen={openKey === "ALL"}
            layout="strip"
            onToggle={() => toggleDrawer("ALL")}
          />
          {CATEGORIES.map((cat) => (
            <Drawer
              key={cat}
              label={CATEGORY_LABELS[cat]}
              items={grouped[cat] ?? []}
              isOpen={openKey === cat}
              layout="grid"
              onToggle={() => toggleDrawer(cat)}
            />
          ))}
        </div>
        <div className={styles.plinth} aria-hidden="true" />
      </div>
    </>
  );
}

function groupByCategory(
  items: WardrobeItem[],
): Partial<Record<Category, WardrobeItem[]>> {
  const groups: Partial<Record<Category, WardrobeItem[]>> = {};

  for (const item of items) {
    /* category は自由文字列で保存されているため、既知のカテゴリだけ拾う */
    if (!isCategory(item.category)) {
      continue;
    }

    const list = groups[item.category] ?? [];
    list.push(item);
    groups[item.category] = list;
  }

  return groups;
}
