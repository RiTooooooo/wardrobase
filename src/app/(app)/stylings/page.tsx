import type { CSSProperties, ReactElement } from "react";

import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { PreviewCardItem } from "@/components/features/styling/StylingCardPreview";
import { StylingCardPreview } from "@/components/features/styling/StylingCardPreview";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Fab } from "@/components/ui/Fab";
import { IconChevronRight, IconPlus } from "@/components/ui/icons";
import { PageTitle } from "@/components/ui/PageTitle";
import { isSeason, seasonGroupsOf } from "@/domain/item/season";
import type { StylingWithItems } from "@/infrastructure/prisma/stylingRepository";
import { findStylingsByUser } from "@/infrastructure/prisma/stylingRepository";
import { createViewUrl } from "@/infrastructure/s3/presignedUrl";
import { auth } from "@/lib/auth";

import styles from "./page.module.css";

type StylingCard = {
  id: string;
  name: string;
  seasons: string[];
  items: PreviewCardItem[];
};

/* 実行中のPrismaクライアントが scale 列を知らない場合の保険（ボード画面と同じ） */
function toScale(value: number): number {
  return Number.isFinite(value) ? value : 1;
}

async function toStylingCard(styling: StylingWithItems): Promise<StylingCard> {
  const items: PreviewCardItem[] = [];
  for (const si of styling.items) {
    const imageUrl = si.item.imagePath
      ? await createViewUrl(si.item.imagePath)
      : null;
    items.push({
      id: si.item.id,
      name: si.item.name,
      imageUrl,
      x: si.positionX,
      y: si.positionY,
      zIndex: si.zIndex,
      scale: toScale(si.scale),
    });
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
      <PageTitle
        title="Styling"
        subtitle={`全${cards.length}件のスタイル`}
        actions={
          <ButtonLink href="/stylings/board/new" narrowHidden>
            スタイルを作成
          </ButtonLink>
        }
      />
      {cards.length === 0 ? <EmptyState /> : <StylingGrid cards={cards} />}
      <Fab href="/stylings/board/new" label="スタイルを作成" />
    </div>
  );
}

function EmptyState(): ReactElement {
  return (
    <p className={styles.empty}>
      スタイリングがまだ登録されていません。
      <Link className={styles.emptyLink} href="/stylings/board/new">
        最初のスタイルを作成する
      </Link>
    </p>
  );
}

function StylingGrid({ cards }: { cards: StylingCard[] }): ReactElement {
  return (
    <div className={styles.grid}>
      {cards.map((card, index) => (
        <Link
          key={card.id}
          href={`/stylings/${card.id}`}
          className={styles.card}
          style={{ "--index": index } as CSSProperties}
        >
          <div className={styles.cardHead}>
            <span className={styles.cardName}>{card.name}</span>
            <span className={styles.chev} aria-hidden="true">
              <IconChevronRight />
            </span>
          </div>
          <StylingCardPreview stylingId={card.id} items={card.items} />
          <div className={styles.cardFoot}>
            <span className={styles.seasons}>{seasonText(card.seasons)}</span>
            <span className={styles.count}>{card.items.length}点</span>
          </div>
        </Link>
      ))}
      <Link
        className={styles.ghost}
        href="/stylings/board/new"
        style={{ "--index": cards.length } as CSSProperties}
      >
        <IconPlus size={18} />
        スタイルを追加
      </Link>
    </div>
  );
}

/* 季節はチップにせずプレーンテキストで添える（押せるものと誤認させない） */
function seasonText(seasons: string[]): string {
  return seasonGroupsOf(seasons.filter(isSeason)).join("・");
}

