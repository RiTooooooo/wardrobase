import type { ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SEASON_LABELS } from "@/domain/item/season";
import type { Season } from "@/domain/item/season";
import type { StylingWithItems } from "@/infrastructure/prisma/stylingRepository";
import { findStylingsByUser } from "@/infrastructure/prisma/stylingRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

type CardItem = { name: string; imageUrl: string | null };

type StylingCard = {
  id: string;
  name: string;
  seasons: string[];
  items: CardItem[];
};

async function toStylingCard(
  styling: StylingWithItems,
): Promise<StylingCard> {
  const items: CardItem[] = [];
  for (const si of styling.items) {
    const imageUrl = si.item.imagePath
      ? await createViewUrl(si.item.imagePath)
      : null;
    items.push({ name: si.item.name, imageUrl });
  }
  return {
    id: styling.id,
    name: styling.name,
    seasons: styling.seasons,
    items,
  };
}

export default async function StylingListPage(): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  const stylings = await findStylingsByUser(session.user.id);
  const cards = await Promise.all(stylings.map(toStylingCard));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>スタイリング</h1>
          <span className={styles.count}>{cards.length} styles</span>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.secondaryButton} href="/stylings/new">
            スタイリングを登録
          </Link>
          <Link className={styles.addButton} href="/stylings/board/new">
            ボードで作成
          </Link>
        </div>
      </header>
      {cards.length === 0 ? (
        <EmptyState />
      ) : (
        <StylingGrid cards={cards} />
      )}
    </div>
  );
}

function EmptyState(): ReactElement {
  return (
    <p className={styles.empty}>
      スタイリングがまだ登録されていません。
      <Link className={styles.emptyLink} href="/stylings/new">
        最初のスタイリングを登録する
      </Link>
    </p>
  );
}

function StylingGrid({
  cards,
}: {
  cards: StylingCard[];
}): ReactElement {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/stylings/${card.id}`}
          className={styles.card}
        >
          <span className={styles.cardName}>{card.name}</span>
          <CardItemThumbs items={card.items} />
          <CardSeasons seasons={card.seasons} />
        </Link>
      ))}
    </div>
  );
}

function CardItemThumbs({
  items,
}: {
  items: CardItem[];
}): ReactElement | null {
  if (items.length === 0) return null;

  return (
    <div className={styles.cardItems}>
      {items.map((item, index) => (
        <div key={index} className={styles.cardThumb}>
          {item.imageUrl ? (
            <img
              className={styles.cardThumbImage}
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
            />
          ) : (
            <span className={styles.cardThumbName}>{item.name}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CardSeasons({
  seasons,
}: {
  seasons: string[];
}): ReactElement | null {
  if (seasons.length === 0) return null;

  return (
    <div className={styles.cardSeasons}>
      {seasons.map((season) => (
        <span key={season} className={styles.seasonChip}>
          {SEASON_LABELS[season as Season]}
        </span>
      ))}
    </div>
  );
}
