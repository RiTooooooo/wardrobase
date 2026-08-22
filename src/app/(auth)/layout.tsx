import type { ReactElement, ReactNode } from "react";

import { ClosetIntro } from "@/components/features/auth/ClosetIntro";

import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className={styles.container}>
      <ClosetIntro>
        <main className={styles.card}>
          <h1 className={styles.logo}>
            wardro<span className={styles.accent}>base</span>
          </h1>
          {children}
        </main>
      </ClosetIntro>
    </div>
  );
}
