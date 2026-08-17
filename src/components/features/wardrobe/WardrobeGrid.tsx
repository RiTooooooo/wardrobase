"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import { ItemCard } from "./ItemCard";
import { WardrobeFilters } from "./WardrobeFilters";
import { filterAndSort } from "./wardrobeFilter";
import type { WardrobeFilters as Filters, WardrobeItem } from "./wardrobeTypes";
import styles from "./WardrobeGrid.module.css";

type Props = {
  items: WardrobeItem[];
};

const DEFAULT_FILTERS: Filters = {
  category: null,
  color: null,
  season: null,
  query: "",
  sort: "createdAt-desc",
};

export function WardrobeGrid({ items }: Props): ReactElement {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const filtered = useMemo(
    () => filterAndSort(items, filters),
    [items, filters],
  );

  return (
    <>
      <WardrobeFilters filters={filters} onChange={setFilters} />
      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p className={styles.noResults}>
            条件に一致するアイテムがありません
          </p>
        ) : null}
        {filtered.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} />
        ))}
        {filtered.length > 0 ? <AddTile index={filtered.length} /> : null}
      </div>
    </>
  );
}

/*
 * グリッド末尾の追加タイル。
 * アイテムが少ないうちは空きが目立つため、その隙間を埋めつつ
 * 見ている場所からそのまま追加へ進めるようにする。
 */
function AddTile({ index }: { index: number }): ReactElement {
  const order = { "--index": index } as CSSProperties;

  return (
    <Link className={styles.addTile} href="/items/new" style={order}>
      <span className={styles.addTileLabel}>アイテムを追加</span>
    </Link>
  );
}
