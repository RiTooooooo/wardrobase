import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { OutfitWithItems } from "@/infrastructure/prisma/outfitRepository";
import { findOutfitsByUser } from "@/infrastructure/prisma/outfitRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

type ThumbItem = { name: string; imageUrl: string | null };

type OutfitEntry = {
  id: string;
  dateLabel: string;
  satisfaction: number | null;
  weather: string | null;
  memo: string | null;
  items: ThumbItem[];
};

type DateGroup = {
  label: string;
  entries: OutfitEntry[];
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

async function toOutfitEntry(
  outfit: OutfitWithItems,
): Promise<OutfitEntry> {
  const items: ThumbItem[] = [];
  for (const oi of outfit.items) {
    const imageUrl = oi.item.imagePath
      ? await createViewUrl(oi.item.imagePath)
      : null;
    items.push({ name: oi.item.name, imageUrl });
  }
  return {
    id: outfit.id,
    dateLabel: formatDate(outfit.wornOn),
    satisfaction: outfit.satisfaction,
    weather: outfit.weather,
    memo: outfit.memo,
    items,
  };
}

function groupByDate(entries: OutfitEntry[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last !== undefined && last.label === entry.dateLabel) {
      last.entries.push(entry);
    } else {
      groups.push({ label: entry.dateLabel, entries: [entry] });
    }
  }
  return groups;
}

export default async function OutfitListPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const outfits = await findOutfitsByUser(session.user.id);
  const entries = await Promise.all(outfits.map(toOutfitEntry));
  const groups = groupByDate(entries);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>コーデ記録</h1>
          <span className={styles.count}>{entries.length} records</span>
        </div>
        <Link className={styles.addButton} href="/outfits/new">
          コーデを記録
        </Link>
      </header>
      <Link className={styles.backLink} href="/wardrobe">
        ワードローブに戻る
      </Link>
      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <OutfitTimeline groups={groups} />
      )}
    </div>
  );
}

function EmptyState(): ReactElement {
  return (
    <p className={styles.empty}>
      コーデ記録がまだありません。
      <Link className={styles.emptyLink} href="/outfits/new">
        最初のコーデを記録する
      </Link>
    </p>
  );
}

function OutfitTimeline({
  groups,
}: {
  groups: DateGroup[];
}): ReactElement {
  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className={styles.dateGroup}>
          <span className={styles.dateLabel}>{group.label}</span>
          {group.entries.map((entry) => (
            <OutfitCard key={entry.id} entry={entry} />
          ))}
        </div>
      ))}
    </>
  );
}

function OutfitCard({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement {
  return (
    <Link href={`/outfits/${entry.id}`} className={styles.card}>
      <CardThumbs items={entry.items} />
      <div className={styles.cardBody}>
        <CardMeta entry={entry} />
        {entry.memo !== null ? (
          <span className={styles.cardMemo}>{entry.memo}</span>
        ) : null}
      </div>
    </Link>
  );
}

function CardThumbs({
  items,
}: {
  items: ThumbItem[];
}): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <div className={styles.cardThumbs}>
      {items.map((item, index) => (
        <div key={index} className={styles.cardThumb}>
          {item.imageUrl ? (
            <img
              className={styles.cardThumbImage}
              src={item.imageUrl}
              alt={item.name}
            />
          ) : (
            <span className={styles.cardThumbName}>{item.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CardMeta({
  entry,
}: {
  entry: OutfitEntry;
}): ReactElement | null {
  const parts: string[] = [];
  if (entry.satisfaction !== null) {
    parts.push(`満足度 ${entry.satisfaction}/5`);
  }
  if (entry.weather !== null) {
    parts.push(entry.weather);
  }

  if (parts.length === 0) return null;

  return <span className={styles.cardMeta}>{parts.join(" / ")}</span>;
}
