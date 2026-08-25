import { ViewTransition } from "react";
import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FadeInImage } from "@/components/ui/FadeInImage";
import { CATEGORY_LABELS } from "@/domain/item/category";
import type { Color } from "@/domain/item/color";
import { COLOR_META } from "@/domain/item/color";
import { SEASON_LABELS } from "@/domain/item/season";
import { findItemById } from "@/infrastructure/prisma/itemRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { ItemDetailActions } from "./ItemDetailActions";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

type ItemRow = NonNullable<Awaited<ReturnType<typeof findItemById>>>;

export default async function ItemDetailPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const item = await findItemById(session.user.id, id);

  if (item === null) {
    notFound();
  }

  const imageUrl = item.imagePath
    ? await createViewUrl(item.imagePath)
    : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/wardrobe">
          ワードローブに戻る
        </Link>
        {/* 一覧ページと同じ文法: タイトルが先、操作列（主役1つ+テキスト脇役）が後 */}
        <h1 className={styles.title}>{item.name}</h1>
        <ItemDetailActions itemId={id} />
      </div>
      {/* 広い画面では写真の隣に、商品の下げ札のような情報カードを並べる */}
      <div className={styles.content}>
        <ItemImage id={id} imageUrl={imageUrl} name={item.name} />
        <ItemDetails item={item} />
      </div>
    </div>
  );
}

/* ワードローブの開いた引き出しのカードから、写真がモーフして辿り着く */
function ItemImage({
  id,
  imageUrl,
  name,
}: {
  id: string;
  imageUrl: string | null;
  name: string;
}): ReactElement {
  return (
    <ViewTransition name={`item-image-${id}`} share="morph">
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <FadeInImage
            className={styles.image}
            src={imageUrl}
            alt={name}
            loading="eager"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
    </ViewTransition>
  );
}

function ItemDetails({ item }: { item: ItemRow }): ReactElement {
  const categoryLabel = CATEGORY_LABELS[item.category];
  const colorLabel = COLOR_META[item.color as Color].label;
  const seasonLabels = item.seasons.map((s) => SEASON_LABELS[s]);

  return (
    <div className={styles.details}>
      <DetailField label="カテゴリ" value={categoryLabel} />
      <SubCategoryField value={item.subCategory} />
      <DetailField label="色" value={colorLabel} />
      <SeasonField labels={seasonLabels} />
      <OptionalField label="ブランド" value={item.brand} />
      <PriceField price={item.price} />
      <DateField date={item.purchasedAt} />
      <OptionalField label="メモ" value={item.memo} />
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

function OptionalField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): ReactElement | null {
  if (value === null) return null;

  return <DetailField label={label} value={value} />;
}

function SubCategoryField({
  value,
}: {
  value: string | null;
}): ReactElement | null {
  return <OptionalField label="サブカテゴリ" value={value} />;
}

function SeasonField({
  labels,
}: {
  labels: string[];
}): ReactElement | null {
  if (labels.length === 0) return null;

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>シーズン</span>
      <div className={styles.seasons}>
        {labels.map((label) => (
          <span key={label} className={styles.seasonTag}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function PriceField({
  price,
}: {
  price: number | null;
}): ReactElement | null {
  if (price === null) return null;

  return <DetailField label="購入価格" value={`${price.toLocaleString()}円`} />;
}

function DateField({
  date,
}: {
  date: Date | null;
}): ReactElement | null {
  if (date === null) return null;

  return (
    <DetailField
      label="購入日"
      value={date.toLocaleDateString("ja-JP")}
    />
  );
}
