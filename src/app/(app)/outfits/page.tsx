import type { ReactElement } from "react";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OutfitTimeline } from "@/components/features/outfit/OutfitTimeline";
import type {
  OutfitEntry,
  ThumbItem,
  TimelineDay,
} from "@/components/features/outfit/timelineTypes";
import { Fab } from "@/components/ui/Fab";
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

/* タイムラインの日付列。「08」と「8月・金」に分けて描く */
function formatMonthWeekday(date: Date): string {
  const month = date.toLocaleDateString("ja-JP", { month: "long" });
  const weekday = date.toLocaleDateString("ja-JP", { weekday: "short" });
  return `${month}・${weekday}`;
}

type DatedEntry = {
  date: string;
  dayNumber: string;
  monthWeekday: string;
  entry: OutfitEntry;
};

async function toDatedEntry(outfit: OutfitWithItems): Promise<DatedEntry> {
  const items: ThumbItem[] = [];
  for (const oi of outfit.items) {
    const imageUrl = oi.item.imagePath
      ? await createViewUrl(oi.item.imagePath)
      : null;
    items.push({ id: oi.item.id, name: oi.item.name, imageUrl });
  }
  return {
    date: toIsoDate(outfit.wornOn),
    dayNumber: String(outfit.wornOn.getDate()).padStart(2, "0"),
    monthWeekday: formatMonthWeekday(outfit.wornOn),
    entry: { id: outfit.id, memo: outfit.memo, items },
  };
}

/* 同じ日の記録を1つの日付列にまとめる（並びは新しい順のまま） */
function groupByDate(entries: DatedEntry[]): TimelineDay[] {
  const days: TimelineDay[] = [];
  for (const item of entries) {
    const last = days.at(-1);
    if (last !== undefined && last.date === item.date) {
      last.entries.push(item.entry);
    } else {
      days.push({
        date: item.date,
        dayNumber: item.dayNumber,
        monthWeekday: item.monthWeekday,
        entries: [item.entry],
      });
    }
  }
  return days;
}

export default async function OutfitListPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const outfits = await findOutfitsByUser(session.user.id);
  const entries = await Promise.all(outfits.map(toDatedEntry));
  const days = groupByDate(entries);

  return (
    <div className={styles.page}>
      <OutfitTimeline days={days} totalCount={entries.length} />
      <Fab href="/outfits/new" label="コーデを記録" />
    </div>
  );
}
