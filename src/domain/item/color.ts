/**
 * 色のプリセット。
 *
 * 自由入力にすると表記ゆれ（「白」「ホワイト」「White」）で
 * フィルタが機能しなくなるため、選択式にする。
 * `hex` は一覧のドット表示に使う。
 */
export const COLOR_VALUES = [
  "WHITE",
  "BLACK",
  "GRAY",
  "CHARCOAL",
  "NAVY",
  "BLUE",
  "INDIGO",
  "BEIGE",
  "BROWN",
  "OLIVE",
  "GREEN",
  "RED",
  "YELLOW",
  "PURPLE",
  "OTHER",
] as const;

export type Color = (typeof COLOR_VALUES)[number];

interface ColorMeta {
  label: string;
  hex: string;
}

export const COLOR_META: Record<Color, ColorMeta> = {
  WHITE: { label: "ホワイト", hex: "#f5f5f5" },
  BLACK: { label: "ブラック", hex: "#1a1a1a" },
  GRAY: { label: "グレー", hex: "#8a8a8a" },
  CHARCOAL: { label: "チャコール", hex: "#3a3d42" },
  NAVY: { label: "ネイビー", hex: "#2b3a55" },
  BLUE: { label: "ブルー", hex: "#4169e1" },
  INDIGO: { label: "インディゴ", hex: "#38456b" },
  BEIGE: { label: "ベージュ", hex: "#d6c6a8" },
  BROWN: { label: "ブラウン", hex: "#6b4f3a" },
  OLIVE: { label: "オリーブ", hex: "#6b7048" },
  GREEN: { label: "グリーン", hex: "#4a7c59" },
  RED: { label: "レッド", hex: "#b3423a" },
  YELLOW: { label: "イエロー", hex: "#d4a843" },
  PURPLE: { label: "パープル", hex: "#6b5b95" },
  OTHER: { label: "その他", hex: "#555555" },
};

export function isColor(value: unknown): value is Color {
  return (
    typeof value === "string" &&
    (COLOR_VALUES as readonly string[]).includes(value)
  );
}
