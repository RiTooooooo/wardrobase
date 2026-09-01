"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { IconSearch } from "@/components/ui/icons";
import { PageTitle } from "@/components/ui/PageTitle";

import { CategoryChips } from "./CategoryChips";
import { FilterRow } from "./FilterRow";
import { ItemCard } from "./ItemCard";
import { filterAndSort } from "./wardrobeFilter";
import styles from "./WardrobeView.module.css";
import type { WardrobeFilters, WardrobeItem } from "./wardrobeTypes";

/*
 * ワードローブの一覧。初期表示から全アイテムの写真グリッドを見せる。
 * カテゴリは件数付きチップで絞り込み、検索・季節・並び替えは
 * 虫めがねボタンで開く1行に畳んでおく。
 */

const DEFAULT_FILTERS: WardrobeFilters = {
  category: null,
  color: null,
  season: null,
  query: "",
  sort: "createdAt-desc",
};

/** 既定値から変わっている検索条件の数。トグルボタンに出して状態を見せる */
function activeCount(filters: WardrobeFilters): number {
  let count = 0;
  if (filters.season !== null) count += 1;
  if (filters.query !== "") count += 1;
  if (filters.sort !== "createdAt-desc") count += 1;
  return count;
}

export function WardrobeView({
  items,
}: {
  items: WardrobeItem[];
}): ReactElement {
  const [filters, setFilters] = useState<WardrobeFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(
    () => filterAndSort(items, filters),
    [items, filters],
  );

  return (
    <>
      <PageTitle
        title="Wardrobe"
        subtitle={`全${items.length}点のアイテム`}
        actions={
          <>
            <FilterToggle
              open={filtersOpen}
              badge={activeCount(filters)}
              onToggle={() => setFiltersOpen((open) => !open)}
            />
            <ButtonLink href="/items/new" narrowHidden>
              アイテムを追加
            </ButtonLink>
          </>
        }
      />
      <CategoryChips
        items={items}
        selected={filters.category}
        onSelect={(category) => setFilters({ ...filters, category })}
      />
      {filtersOpen ? <FilterRow filters={filters} onChange={setFilters} /> : null}
      <Grid items={filtered} />
    </>
  );
}

function FilterToggle({
  open,
  badge,
  onToggle,
}: {
  open: boolean;
  badge: number;
  onToggle: () => void;
}): ReactElement {
  const className = open
    ? `${styles.filterButton} ${styles.filterButtonOpen}`
    : styles.filterButton;

  return (
    <button
      type="button"
      className={className}
      aria-label="検索と絞り込み"
      aria-expanded={open}
      onClick={onToggle}
    >
      <IconSearch />
      {badge > 0 ? <span className={styles.filterBadge}>{badge}</span> : null}
    </button>
  );
}

function Grid({ items }: { items: WardrobeItem[] }): ReactElement {
  if (items.length === 0) {
    return <p className={styles.noMatch}>条件に合うアイテムがありません</p>;
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <ItemCard key={item.id} item={item} index={index} morph />
      ))}
    </div>
  );
}
