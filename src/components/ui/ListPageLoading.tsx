import type { ReactElement, ReactNode } from "react";

import { PageTitle } from "@/components/ui/PageTitle";

/*
 * 一覧ページの loading.tsx が描く「見出しだけ」の途中状態。
 *
 * スケルトン（灰色の箱）は置かず、押した瞬間に見出しと作成導線だけを
 * 切り替える。件数などデータが要る補足は空行で高さだけ確保し、
 * 本文が届いたときに見出しが上下に動かないようにする。
 *
 * loading.tsx があると Next は見出しまでを事前取得し、遷移の最初の一歩が
 * サーバー待ちなしで始まる（無い動的ページは事前取得されない）。
 */
export function ListPageLoading({
  className,
  title,
  actions,
  children,
}: {
  className: string;
  title: string;
  actions?: ReactNode;
  children?: ReactNode;
}): ReactElement {
  return (
    <div className={className}>
      <PageTitle title={title} subtitle={" "} actions={actions} />
      {children}
    </div>
  );
}
