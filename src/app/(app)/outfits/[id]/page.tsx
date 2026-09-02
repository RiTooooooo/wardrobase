import { ViewTransition } from "react";
import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SatisfactionStars } from "@/components/features/outfit/SatisfactionStars";
import type { OutfitWithItems } from "@/infrastructure/prisma/outfitRepository";
import { findOutfitById } from "@/infrastructure/prisma/outfitRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { OutfitDetailActions } from "./OutfitDetailActions";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OutfitDetailPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const outfit = await findOutfitById(session.user.id, id);

  if (outfit === null) {
    notFound();
  }

  const outfitItems = await buildOutfitItems(outfit);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/outfits">
          Outfitsに戻る
        </Link>
        <h1 className={styles.title}>
          {formatDate(outfit.wornOn)} のコーデ
        </h1>
      </div>
      <OutfitDetailActions outfitId={id} />
      <OutfitItems outfitId={id} items={outfitItems} />
      <OutfitMeta outfit={outfit} />
    </div>
  );
}

type OutfitItemView = { id: string; name: string; imageUrl: string | null };

async function buildOutfitItems(
  outfit: OutfitWithItems,
): Promise<OutfitItemView[]> {
  const result: OutfitItemView[] = [];
  for (const oi of outfit.items) {
    const imageUrl = oi.item.imagePath
      ? await createViewUrl(oi.item.imagePath)
      : null;
    result.push({ id: oi.item.id, name: oi.item.name, imageUrl });
  }
  return result;
}

/*
 * 服のタイル。タイムラインの同じ写真からモーフして受け取る。
 * 遷移名は OutfitRecordCard の Thumbs と揃えること。
 */
function OutfitItems({
  outfitId,
  items,
}: {
  outfitId: string;
  items: OutfitItemView[];
}): ReactElement {
  return (
    <div className={styles.itemsGrid}>
      {items.map((item) => (
        <ViewTransition
          key={item.id}
          name={`outfit-${outfitId}-item-${item.id}`}
          share="morph"
        >
          <Link href={`/items/${item.id}`} className={styles.itemThumb}>
            {item.imageUrl ? (
              <img
                className={styles.itemThumbImage}
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
              />
            ) : (
              <span className={styles.itemThumbName}>{item.name}</span>
            )}
          </Link>
        </ViewTransition>
      ))}
    </div>
  );
}

function OutfitMeta({ outfit }: { outfit: OutfitWithItems }): ReactElement {
  return (
    <div className={styles.details}>
      {outfit.satisfaction !== null ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>お気に入り度</span>
          <SatisfactionStars value={outfit.satisfaction} />
        </div>
      ) : null}
      {outfit.weather !== null ? (
        <DetailField label="天気" value={outfit.weather} />
      ) : null}
      {outfit.memo !== null ? (
        <DetailField label="メモ" value={outfit.memo} />
      ) : null}
    </div>
  );
}

function DetailField({ label, value }: {
  label: string; value: string;
}): ReactElement {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP");
}
