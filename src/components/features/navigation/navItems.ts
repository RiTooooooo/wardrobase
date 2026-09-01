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

/* 行き先の名前は各画面のセリフ体見出しと同じ英語表記で揃える */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/wardrobe", label: "Wardrobe", match: ["/wardrobe", "/items"] },
  { href: "/stylings", label: "Styling", match: ["/stylings"] },
  { href: "/outfits", label: "Outfits", match: ["/outfits"] },
];

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isCurrent(pathname: string, item: NavItem): boolean {
  return item.match.some((base) => isUnder(pathname, base));
}
