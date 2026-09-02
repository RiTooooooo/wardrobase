"use client";

import { useState } from "react";
import type { ChangeEvent, MouseEvent, ReactElement } from "react";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { IconCalendar } from "@/components/ui/icons";
import { PageTitle } from "@/components/ui/PageTitle";

import { OutfitRecordCard } from "./OutfitRecordCard";
import styles from "./OutfitTimeline.module.css";
import type { TimelineDay } from "./timelineTypes";

/*
 * コーデ記録のタイムライン。中央820pxの1カラムに、
 * 日付（セリフ体の数字）と記録カードを新しい順で流す。
 * 日付検索はその日の記録までスクロールして着地させる。
 */

type Props = {
  days: TimelineDay[];
  totalCount: number;
};

function dayDomId(date: string): string {
  return `outfit-day-${date}`;
}

function scrollToDay(date: string): void {
  const target = document.getElementById(dayDomId(date));
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  target?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function OutfitTimeline({ days, totalCount }: Props): ReactElement {
  const [searchDate, setSearchDate] = useState("");
  const [focusDate, setFocusDate] = useState<string | null>(null);
  const notFound =
    searchDate !== "" && !days.some((day) => day.date === searchDate);

  function handleDateChange(e: ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    setSearchDate(value);
    const found = days.some((day) => day.date === value);
    setFocusDate(found ? value : null);
    if (found) scrollToDay(value);
  }

  return (
    <div className={styles.column}>
      <PageTitle
        title="Outfits"
        subtitle={`全${totalCount}件の記録`}
        actions={
          <>
            <DateJump value={searchDate} onChange={handleDateChange} />
            <ButtonLink href="/outfits/new" narrowHidden>
              コーデを記録
            </ButtonLink>
          </>
        }
      />
      {notFound ? (
        <p className={styles.searchEmpty} role="status">
          この日の記録はありません
        </p>
      ) : null}
      {days.length === 0 ? <EmptyState /> : (
        <Timeline days={days} focusDate={focusDate} />
      )}
    </div>
  );
}

/* 対応ブラウザではワンタップでカレンダーを開く（非対応・不許可なら手入力に素通し） */
function openPicker(e: MouseEvent<HTMLInputElement>): void {
  try {
    e.currentTarget.showPicker();
  } catch {
    /* フォーカスして手入力できるので何もしない */
  }
}

/* 日付入力。iOS Safari は空の date input に何も表示しないため、文字を重ねる */
function DateJump({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}): ReactElement {
  const inputClass =
    value === ""
      ? `${styles.dateInput} ${styles.dateInputEmpty}`
      : styles.dateInput;

  return (
    <label className={styles.dateField}>
      <span className={styles.dateIcon} aria-hidden="true">
        <IconCalendar />
      </span>
      <input
        type="date"
        className={inputClass}
        aria-label="日付で開く"
        value={value}
        onChange={onChange}
        onClick={openPicker}
      />
      {value === "" ? (
        <span className={styles.datePlaceholder} aria-hidden="true">
          日付で開く
        </span>
      ) : null}
    </label>
  );
}

/* 日をまたいだ通し番号。入場スタッガーを一覧全体で連続させる */
function entryOffsets(days: TimelineDay[]): number[] {
  const offsets: number[] = [];
  let total = 0;
  for (const day of days) {
    offsets.push(total);
    total += day.entries.length;
  }
  return offsets;
}

function Timeline({
  days,
  focusDate,
}: {
  days: TimelineDay[];
  focusDate: string | null;
}): ReactElement {
  const offsets = entryOffsets(days);

  return (
    <div className={styles.timeline}>
      {days.map((day, dayIndex) => (
        <div
          key={day.date}
          id={dayDomId(day.date)}
          className={
            day.date === focusDate
              ? `${styles.dayGroup} ${styles.dayFocused}`
              : styles.dayGroup
          }
        >
          <div className={styles.day}>
            <span className={styles.dayNumber}>{day.dayNumber}</span>
            <span className={styles.dayMeta}>{day.monthWeekday}</span>
          </div>
          <div className={styles.records}>
            {day.entries.map((entry, entryIndex) => (
              <OutfitRecordCard
                key={entry.id}
                entry={entry}
                index={offsets[dayIndex] + entryIndex}
              />
            ))}
          </div>
        </div>
      ))}
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
