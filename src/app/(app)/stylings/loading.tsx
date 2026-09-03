import type { ReactElement } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Fab } from "@/components/ui/Fab";
import { ListPageLoading } from "@/components/ui/ListPageLoading";

import styles from "./page.module.css";

export default function StylingListLoading(): ReactElement {
  return (
    <ListPageLoading
      className={styles.page}
      title="Styling"
      actions={
        <ButtonLink href="/stylings/board/new" narrowHidden>
          スタイルを作成
        </ButtonLink>
      }
    >
      <Fab href="/stylings/board/new" label="スタイルを作成" />
    </ListPageLoading>
  );
}
