import type { ReactElement } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Fab } from "@/components/ui/Fab";
import { ListPageLoading } from "@/components/ui/ListPageLoading";

import styles from "./page.module.css";

export default function OutfitListLoading(): ReactElement {
  return (
    <ListPageLoading
      className={styles.page}
      title="Outfits"
      actions={
        <ButtonLink href="/outfits/new" narrowHidden>
          コーデを記録
        </ButtonLink>
      }
    >
      <Fab href="/outfits/new" label="コーデを記録" />
    </ListPageLoading>
  );
}
