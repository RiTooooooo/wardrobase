import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { seasonGroupsOf } from "@/domain/item/season";
import type { StylingWithItems } from "@/infrastructure/prisma/stylingRepository";
import { findStylingById } from "@/infrastructure/prisma/stylingRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import { StylingDetailActions } from "./StylingDetailActions";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StylingDetailPage({
  params,
}: Props): Promise<ReactElement> {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const styling = await findStylingById(session.user.id, id);

  if (styling === null) {
    notFound();
  }

  const stylingItems = await buildStylingItems(styling);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link className={styles.back} href="/stylings">
          Stylingに戻る
        </Link>
        <h1 className={styles.title}>{styling.name}</h1>
      </div>
      <StylingDetailActions stylingId={id} />
      <StylingItems items={stylingItems} />
      <StylingMeta styling={styling} />
    </div>
  );
}

type StylingItemView = {
  id: string;
  name: string;
  imageUrl: string | null;
};

async function buildStylingItems(
  styling: StylingWithItems,
): Promise<StylingItemView[]> {
  const result: StylingItemView[] = [];
  for (const si of styling.items) {
    const imageUrl = si.item.imagePath
      ? await createViewUrl(si.item.imagePath)
      : null;
    result.push({ id: si.item.id, name: si.item.name, imageUrl });
  }
  return result;
}

function StylingItems({
  items,
}: {
  items: StylingItemView[];
}): ReactElement {
  return (
    <div className={styles.itemsGrid}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/items/${item.id}`}
          className={styles.itemThumb}
        >
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
      ))}
    </div>
  );
}

function StylingMeta({
  styling,
}: {
  styling: StylingWithItems;
}): ReactElement {
  return (
    <div className={styles.details}>
      {styling.seasons.length > 0 ? (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>季節</span>
          <div className={styles.seasonChips}>
            {seasonGroupsOf(styling.seasons).map((group) => (
              <span key={group} className={styles.seasonChip}>
                {group}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {styling.memo !== null ? (
        <DetailField label="メモ" value={styling.memo} />
      ) : null}
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
