/**
 * カテゴリとサブカテゴリ。
 *
 * 値は Prisma の `Category` enum と同じ文字列（season.ts と同じ方針）。
 */
export const CATEGORIES = [
  "TOPS",
  "BOTTOMS",
  "OUTER",
  "SHOES",
  "BAG",
  "ACCESSORY",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  TOPS: "Tops",
  BOTTOMS: "Bottoms",
  OUTER: "Outerwear",
  SHOES: "Shoes",
  BAG: "Bags",
  ACCESSORY: "Accessories",
};

/**
 * カテゴリごとのサブカテゴリ候補。
 * 自由入力も許容するため、ここにない値を弾いてはいけない（入力補助のための一覧）。
 */
export const SUB_CATEGORIES: Record<Category, readonly string[]> = {
  TOPS: ["Tシャツ", "シャツ", "ニット", "スウェット", "パーカー", "カットソー"],
  BOTTOMS: ["デニム", "スラックス", "チノパン", "ショーツ", "カーゴパンツ"],
  OUTER: ["ジャケット", "コート", "ブルゾン", "ダウン", "ベスト"],
  SHOES: ["スニーカー", "レザーシューズ", "ブーツ", "サンダル"],
  BAG: ["トートバッグ", "バックパック", "ショルダーバッグ", "ボストンバッグ"],
  ACCESSORY: ["キャップ", "ニット帽", "ベルト", "マフラー", "時計", "メガネ"],
};

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    (CATEGORIES as readonly string[]).includes(value)
  );
}
