"use client";

import { useMemo, useState } from "react";
import type { ReactElement } from "react";

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
        {filtered.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
