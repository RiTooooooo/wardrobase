import type { ReactElement } from "react";

import styles from "./page.module.css";

export default function Home(): ReactElement {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        wardro<span className={styles.accent}>base</span>
      </h1>
      <p className={styles.description}>
        自分の&quot;好き&quot;なスタイリングを、蓄積して使い回すためのワードローブ基盤
      </p>
    </div>
  );
}
