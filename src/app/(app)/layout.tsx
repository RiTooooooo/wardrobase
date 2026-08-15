import type { ReactElement, ReactNode } from "react";

import { AppHeader } from "@/components/features/navigation/AppHeader";
import { BottomNav } from "@/components/features/navigation/BottomNav";

import styles from "./layout.module.css";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <>
      <AppHeader />
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </>
  );
}
