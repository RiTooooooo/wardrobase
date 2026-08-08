"use client";

import { useMemo, useState } from "react";
import type { PointerEvent, ReactElement } from "react";

import { CATEGORIES, CATEGORY_LABELS } from "@/domain/item/category";
import type { Category } from "@/domain/item/category";

import type { DrawerItem } from "./boardTypes";
import styles from "./ClosetDrawer.module.css";
import { DrawerCategory } from "./DrawerCategory";

type Props = {
  items: DrawerItem[];
  placedIds: string[];
  onDragStart: (item: DrawerItem, e: PointerEvent) => void;
};

export function ClosetDrawer({
  items,
  placedIds,
  onDragStart,
}: Props): ReactElement {
  const [openCats, setOpenCats] = useState<Set<Category>>(
    () => new Set(["TOPS"]),
  );

  const grouped = useMemo(
    () => groupByCategory(items),
    [items],
  );

  function toggleCategory(cat: Category): void {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>クローゼット</div>
      {CATEGORIES.map((cat) => {
        const catItems = grouped[cat] ?? [];
        const isOpen = openCats.has(cat);

        return (
          <AccordionSection
            key={cat}
            category={cat}
            count={catItems.length}
            isOpen={isOpen}
            onToggle={toggleCategory}
          >
            <DrawerCategory
              items={catItems}
              placedIds={placedIds}
              onDragStart={onDragStart}
            />
          </AccordionSection>
        );
      })}
    </div>
  );
}

function AccordionSection({
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
  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionHeader}
        onClick={() => onToggle(category)}
        aria-expanded={isOpen}
      >
        <span className={styles.sectionLabel}>
          {CATEGORY_LABELS[category]}
        </span>
        <span className={styles.sectionCount}>{count}</span>
        <span className={styles.chevron}>
          {isOpen ? "▾" : "▸"}
        </span>
      </button>
      {isOpen ? (
        <div className={styles.sectionBody}>{children}</div>
      ) : null}
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
