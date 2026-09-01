import { ViewTransition } from "react";
import type { CSSProperties, ReactElement } from "react";

import Link from "next/link";

import { FadeInImage } from "@/components/ui/FadeInImage";
import { CATEGORY_LABELS, isCategory } from "@/domain/item/category";

import type { WardrobeItem } from "./wardrobeTypes";
import styles from "./ItemCard.module.css";

type Props = {
  item: WardrobeItem;
  /** グリッド内の並び順。表示時のずらし幅に使う */
  index: number;
  /**
   * 詳細ページへ写真をモーフさせるか。
   * 遷移名は画面内で一意である必要があるため、
   * 同じアイテムを二度描く画面では片方だけ true にする。
   */
  morph?: boolean;
};

function CardImage({ item }: { item: WardrobeItem }): ReactElement {
  return (
    <div className={styles.imageWrapper}>
      {item.imageUrl ? (
        <FadeInImage
          className={styles.image}
          src={item.imageUrl}
          alt={item.name}
        />
      ) : (
        <div className={styles.placeholder} />
      )}
    </div>
  );
}

/* 写真が主役のタイル。面や枠は持たず、写真と2行のテキストだけで構成する */
export function ItemCard({ item, index, morph = false }: Props): ReactElement {
  const categoryLabel = isCategory(item.category)
    ? CATEGORY_LABELS[item.category]
    : item.category;
  const order = { "--index": index } as CSSProperties;

  return (
    <Link className={styles.card} href={`/items/${item.id}`} style={order}>
      {morph ? (
        <ViewTransition name={`item-image-${item.id}`} share="morph">
          <CardImage item={item} />
        </ViewTransition>
      ) : (
        <CardImage item={item} />
      )}
      <span className={styles.name}>{item.name}</span>
      <span className={styles.category}>{categoryLabel}</span>
    </Link>
  );
}
