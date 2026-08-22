/*
 * ルックブック（コーデ記録の一覧）で使う表示用の型。
 * ページ（Server Component）で組み立て、OutfitBook（Client）が受け取る。
 */

export type ThumbItem = { name: string; imageUrl: string | null };

export type OutfitEntry = {
  id: string;
  /** 日付検索用の YYYY-MM-DD（ローカル時刻基準） */
  date: string;
  dateLabel: string;
  satisfaction: number | null;
  weather: string | null;
  memo: string | null;
  items: ThumbItem[];
};

export type DateGroup = {
  /** 日付検索用の YYYY-MM-DD（ローカル時刻基準） */
  date: string;
  label: string;
  entries: OutfitEntry[];
};
