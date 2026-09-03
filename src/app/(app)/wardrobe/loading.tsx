import type { ReactElement } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Fab } from "@/components/ui/Fab";
import { ListPageLoading } from "@/components/ui/ListPageLoading";

import styles from "./page.module.css";

export default function WardrobeLoading(): ReactElement {
  return (
    <ListPageLoading
      className={styles.page}
      title="Wardrobe"
      actions={
        <ButtonLink href="/items/new" narrowHidden>
          アイテムを追加
        </ButtonLink>
      }
    >
      <Fab href="/items/new" label="アイテムを追加" />
    </ListPageLoading>
  );
}
