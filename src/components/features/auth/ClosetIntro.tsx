"use client";

import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";

import styles from "./ClosetIntro.module.css";

/*
 * ログイン画面の導入演出。
 *
 * 「クローゼットを開けるとアプリの世界が始まる」を線画で表現する。
 * 線画 → 静止 → 扉が開く → 中身（children）が現れる、の順で進む。
 *
 * 扉だけ HTML でラップしているのは、SVG 要素への 3D 変換
 * （transform-style: preserve-3d）がブラウザによって効かないため。
 * 座標を合わせるため、扉の SVG も本体と同じ viewBox を共有している。
 */

type Props = {
  children: ReactNode;
};

/*
 * 描画が始まってからアニメーションを開始する。
 *
 * CSSアニメーションの時計はスタイルが当たった時点から進むため、初回起動のように
 * 最初の描画が遅れる場面では、画面が見えたときには既に途中まで進んでしまう。
 * 2フレーム待って「実際に描かれた」ことを確かめてから走らせる。
 */
function usePlayAfterPaint(): boolean {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(function onFirstFrame(): void {
      second = requestAnimationFrame(function onSecondFrame(): void {
        setIsPlaying(true);
      });
    });

    return function cancel(): void {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  return isPlaying;
}

export function ClosetIntro({ children }: Props): ReactElement {
  const isPlaying = usePlayAfterPaint();
  const stageClass = isPlaying
    ? `${styles.stage} ${styles.play}`
    : styles.stage;

  return (
    <div className={stageClass}>
      <div className={styles.closet} aria-hidden="true">
        <Carcass />
        <div className={`${styles.door} ${styles.doorLeft}`}>
          <DoorPanel side="left" />
        </div>
        <div className={`${styles.door} ${styles.doorRight}`}>
          <DoorPanel side="right" />
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

/*
 * 縦長にすると開口部が狭くなり、中のフォームとの余白が取れない。
 * 高さを増やさず内寸を稼ぐため、横に広い比率にしている。
 */
const VIEW_BOX = "0 0 540 560";

function Carcass(): ReactElement {
  return (
    <svg className={styles.svg} viewBox={VIEW_BOX} fill="none">
      {/* 天板 */}
      <path
        className={`${styles.line} ${styles.drawBody}`}
        pathLength="1"
        d="M28 6 H512 V32 H28 Z"
      />
      {/* 本体 */}
      <path
        className={`${styles.line} ${styles.drawBody}`}
        pathLength="1"
        d="M44 32 H496 V500 H44 Z"
      />
      {/* 内側の開口部 */}
      <path
        className={`${styles.line} ${styles.drawInterior}`}
        pathLength="1"
        d="M62 50 H478 V482 H62 Z"
      />
      {/* 台輪 */}
      <path
        className={`${styles.line} ${styles.drawBase}`}
        pathLength="1"
        d="M44 500 H496 V526 H44 Z"
      />
      {/* 脚 */}
      <path
        className={`${styles.line} ${styles.drawBase}`}
        pathLength="1"
        d="M66 526 V540 H90 V526"
      />
      <path
        className={`${styles.line} ${styles.drawBase}`}
        pathLength="1"
        d="M450 526 V540 H474 V526"
      />
    </svg>
  );
}

const DOOR_PATHS = {
  left: {
    outline: "M62 50 H270 V482 H62 Z",
    panel: "M78 66 H254 V466 H78 Z",
    handle: "M256 250 H263 V314 H256 Z",
  },
  right: {
    outline: "M270 50 H478 V482 H270 Z",
    panel: "M286 66 H462 V466 H286 Z",
    handle: "M277 250 H284 V314 H277 Z",
  },
} as const;

function DoorPanel({ side }: { side: "left" | "right" }): ReactElement {
  const paths = DOOR_PATHS[side];

  return (
    <svg className={styles.svg} viewBox={VIEW_BOX} fill="none">
      <path
        className={`${styles.line} ${styles.drawDoor}`}
        pathLength="1"
        d={paths.outline}
      />
      <path
        className={`${styles.line} ${styles.drawDoorPanel}`}
        pathLength="1"
        d={paths.panel}
      />
      <path
        className={`${styles.line} ${styles.drawHandle}`}
        pathLength="1"
        d={paths.handle}
      />
    </svg>
  );
}
