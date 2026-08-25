"use client";

import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import { ItemCard } from "./ItemCard";
import styles from "./WardrobeCloset.module.css";
import type { WardrobeItem } from "./wardrobeTypes";

/* クローゼットの引き出し1段。開閉と中身の描画を担う */

export function Drawer({
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
            <StripContent items={items} morph={isOpen} />
          ) : (
            <GridContent items={items} morph={isOpen} />
          )}
        </div>
      </div>
    </div>
  );
}

type ContentProps = {
  items: WardrobeItem[];
  /** 開いている引き出しだけ true。詳細ページへの写真モーフに使う */
  morph: boolean;
};

/* カテゴリの引き出し。仕切りに沿って服が並ぶ */
function GridContent({ items, morph }: ContentProps): ReactElement {
  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <ItemCard key={item.id} item={item} index={index} morph={morph} />
      ))}
      <AddTile index={items.length} />
    </div>
  );
}

/* 「すべて」の段。横に滑らせて全アイテムを眺める */
function StripContent({ items, morph }: ContentProps): ReactElement {
  return (
    <div className={styles.strip}>
      {items.map((item, index) => (
        <div key={item.id} className={styles.stripItem}>
          <ItemCard item={item} index={index} morph={morph} />
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
