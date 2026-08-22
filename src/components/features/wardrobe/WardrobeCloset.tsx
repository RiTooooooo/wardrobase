"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/domain/item/category";
import type { Category } from "@/domain/item/category";

import { ItemCard } from "./ItemCard";
import { filterAndSort } from "./wardrobeFilter";
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

export function WardrobeCloset({ items }: Props): ReactElement {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [openKey, setOpenKey] = useState<DrawerKey | null>("ALL");
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
      <WardrobeFilters filters={filters} onChange={setFilters} />
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

function Drawer({
  label,
  items,
  isOpen,
  layout,
  onToggle,
}: {
  label: string;
  items: WardrobeItem[];
  isOpen: boolean;
  layout: "grid" | "strip";
  onToggle: () => void;
}): ReactElement {
  const className = isOpen
    ? `${styles.drawer} ${styles.drawerOpen}`
    : styles.drawer;

  return (
    <div className={className}>
      <button
        type="button"
        className={styles.front}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {/* 引き出しの取っ手。家具に見せるための造形 */}
        <span className={styles.pull} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{items.length}</span>
      </button>
      {/*
        開閉をアニメーションさせるため、閉じていても描画したまま高さを潰す。
        閉じた引き出しの中身をキーボードで掴めてしまわないよう inert にする。
      */}
      <div className={styles.interior} inert={!isOpen}>
        <div className={styles.interiorInner}>
          {layout === "strip" ? (
            <StripContent items={items} />
          ) : (
            <GridContent items={items} />
          )}
        </div>
      </div>
    </div>
  );
}

/* カテゴリの引き出し。仕切りに沿って服が並ぶ */
function GridContent({ items }: { items: WardrobeItem[] }): ReactElement {
  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <ItemCard key={item.id} item={item} index={index} />
      ))}
      <AddTile index={items.length} />
    </div>
  );
}

/* 「すべて」の段。横に滑らせて全アイテムを眺める */
function StripContent({ items }: { items: WardrobeItem[] }): ReactElement {
  return (
    <div className={styles.strip}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.stripItem}>
          <ItemCard item={item} index={index} />
        </div>
      ))}
      <div className={styles.stripItem}>
        <AddTile index={items.length} />
      </div>
    </div>
  );
}

/*
 * 引き出し末尾の追加タイル。
 * 線だけの描画で「この引き出しにはまだ入る余地がある」ことを示す。
 * アイテムが1つも無い引き出しでは、これが唯一の中身になり空状態を兼ねる。
 */
function AddTile({ index }: { index: number }): ReactElement {
  const order = { "--index": index } as CSSProperties;

  return (
    <Link className={styles.addTile} href="/items/new" style={order}>
      <span className={styles.addTileLabel}>アイテムを追加</span>
    </Link>
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
