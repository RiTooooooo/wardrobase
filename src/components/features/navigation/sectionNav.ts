import { isCurrent, NAV_ITEMS } from "./navItems";

/*
 * セクション間（Wardrobe / Styling / Outfits）の移動を
 * View Transitions の CSS へ伝える仕掛け。
 *
 * ナビのクリック時に <html data-section-nav> を立て、globals.css が
 * この属性を見て本文の切り替えを「溶け合い＋浅い置き」に差し替える。
 * CSS だけでは「セクションをまたぐ移動かどうか」を知れないため、
 * クリックの瞬間に JS で判定する。
 *
 * 属性は少し置いてから消す。遷移の実行中に消すと適用中の
 * アニメーション規則が外れて表示が飛ぶため、遷移が確実に終わる
 * 長さまで待つ。
 */

const CLEAR_DELAY_MS = 1500;

let clearTimer: ReturnType<typeof setTimeout> | undefined;

function sectionIndexOf(pathname: string): number {
  return NAV_ITEMS.findIndex((item) => isCurrent(pathname, item));
}

export function markSectionNav(fromPathname: string, toHref: string): void {
  const from = sectionIndexOf(fromPathname);
  const to = sectionIndexOf(toHref);

  if (from === -1 || to === -1 || from === to) return;

  document.documentElement.dataset.sectionNav = "true";
  clearTimeout(clearTimer);
  clearTimer = setTimeout(clearSectionNav, CLEAR_DELAY_MS);
}

function clearSectionNav(): void {
  delete document.documentElement.dataset.sectionNav;
}
