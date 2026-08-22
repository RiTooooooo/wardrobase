import type { ReactElement } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OutfitBook } from "@/components/features/outfit/OutfitBook";
import type {
  DateGroup,
  OutfitEntry,
  ThumbItem,
} from "@/components/features/outfit/lookbookTypes";
import type { OutfitWithItems } from "@/infrastructure/prisma/outfitRepository";
import { findOutfitsByUser } from "@/infrastructure/prisma/outfitRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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
    date: toIsoDate(outfit.wornOn),
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
      groups.push({
        date: entry.date,
        label: entry.dateLabel,
        entries: [entry],
      });
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
      <OutfitBook groups={groups} totalCount={entries.length} />
    </div>
  );
}

