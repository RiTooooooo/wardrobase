"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import styles from "./FadeInImage.module.css";

/*
 * 読み込み完了時にぼかしからふわっと現れる画像。
 *
 * 素の状態は「表示済み」にしておき、マウント時点で未読み込みの
 * 画像だけを一旦隠す。JS が動かない環境やキャッシュ済みの画像は
 * 演出なしでそのまま見える（素の状態を完成形にする方針）。
 */

type LoadState = "initial" | "loading" | "loaded";

type Props = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

function stateClass(state: LoadState): string {
  if (state === "loading") return styles.hidden;
  if (state === "loaded") return styles.loaded;
  return "";
}

export function FadeInImage({
  src,
  alt,
  className,
  loading = "lazy",
}: Props): ReactElement {
  const [state, setState] = useState<LoadState>("initial");

  function handleRef(img: HTMLImageElement | null): void {
    if (img !== null && !img.complete) {
      setState("loading");
    }
  }

  function handleLoad(): void {
    setState("loaded");
  }

  return (
    <img
      ref={handleRef}
      className={`${styles.image} ${stateClass(state)} ${className ?? ""}`}
      src={src}
      alt={alt}
      loading={loading}
      onLoad={handleLoad}
    />
  );
}
