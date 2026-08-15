/*
 * ナビゲーションの行き先。
 * 広い画面はヘッダー内、狭い画面は下部のタブバーに出すが、
 * 行き先と現在地の判定は同じものを使う。
 */

export type NavItem = {
  href: string;
  label: string;
  /** この配下にいるときも、その項目を現在地として扱う */
  match: readonly string[];
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/wardrobe", label: "ワードローブ", match: ["/wardrobe", "/items"] },
  { href: "/stylings", label: "スタイリング", match: ["/stylings"] },
  { href: "/outfits", label: "コーデ記録", match: ["/outfits"] },
];

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isCurrent(pathname: string, item: NavItem): boolean {
  return item.match.some((base) => isUnder(pathname, base));
}
