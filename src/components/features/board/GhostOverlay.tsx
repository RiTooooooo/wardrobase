"use client";

import type { ReactElement } from "react";

import type { GhostState } from "./boardTypes";
import styles from "./StylingBoard.module.css";

const ITEM_WIDTH = 160;
const ITEM_HEIGHT = 200;

type Props = {
  ghost: GhostState;
};

export function GhostOverlay({ ghost }: Props): ReactElement {
  return (
    <div
      className={styles.ghost}
      style={{
        left: ghost.clientX - ITEM_WIDTH / 2,
        top: ghost.clientY - ITEM_HEIGHT / 2,
      }}
    >
      {ghost.imageUrl ? (
        <img
          className={styles.ghostImage}
          src={ghost.imageUrl}
          alt={ghost.name}
          draggable={false}
        />
      ) : (
        <span className={styles.ghostName}>{ghost.name}</span>
      )}
    </div>
  );
}
