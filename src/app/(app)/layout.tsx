import type { ReactElement, ReactNode } from "react";

import { AppHeader } from "@/components/features/navigation/AppHeader";
import { BottomNav } from "@/components/features/navigation/BottomNav";
import { PageTransition } from "@/components/features/navigation/PageTransition";

import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <>
      <AppHeader />
      {/* ページ間はクロスフェードで繋ぐ（PageTransition / globals.css の .page-fade） */}
      <PageTransition>
        <main className={styles.main}>{children}</main>
      </PageTransition>
      <BottomNav />
    </>
  );
}
