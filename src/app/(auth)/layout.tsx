import type { ReactElement, ReactNode } from "react";

import styles from "./layout.module.css";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className={styles.container}>
      <main className={styles.card}>
        <h1 className={styles.logo}>
          wardro<span className={styles.accent}>base</span>
        </h1>
        <p className={styles.tagline}>
          自分の好きなスタイリングを、蓄積して使い回す
        </p>
        {children}
      </main>
    </div>
  );
}
