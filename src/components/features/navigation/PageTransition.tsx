"use client";

import { ViewTransition } from "react";
import type { ReactElement, ReactNode } from "react";

import { usePathname } from "next/navigation";

/*
 * ページ本文を包む View Transition。
 *
 * パス名を key にして、ページ遷移では「古い本文が退場し、新しい本文が
 * 入場する」形にする（globals.css の .page-fade）。
 *
 * update は無効にする。loading.tsx（見出しだけの途中状態）から
 * 写真グリッドが届いて差し替わる Suspense の解除も、React からは
 * 本文の「更新」に見えるため、そのままだと本文全体がもう一度
 * クロスフェードし、見出しが二度描かれたように見えてしまう。
 * 到着した中身の見せ方はカード側の入場スタッガーに任せる。
 */
export function PageTransition({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const pathname = usePathname();

  return (
    <ViewTransition key={pathname} default="page-fade" update="none">
      {children}
    </ViewTransition>
  );
}
