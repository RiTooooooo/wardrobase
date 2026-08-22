"use client";

import { useEffect, useState } from "react";

/*
 * 画面が狭いかどうか。
 *
 * ボードは操作方法自体を変える（ドラッグ → タップで配置）ため、
 * CSS のメディアクエリだけでは足りず JS 側でも幅を知る必要がある。
 *
 * サーバー側では幅が分からないので、初期値は必ず false にする。
 * ここで推測して返すと、サーバーとクライアントで異なる HTML になり
 * ハイドレーションがずれる。
 */
const QUERY = "(max-width: 600px)";

export function useIsNarrow(): boolean {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);

    function sync(): void {
      setIsNarrow(mql.matches);
    }

    sync();
    mql.addEventListener("change", sync);

    return function stop(): void {
      mql.removeEventListener("change", sync);
    };
  }, []);

  return isNarrow;
}
