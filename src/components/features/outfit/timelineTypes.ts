/*
 * コーデ記録タイムラインで使う表示用の型。
 * ページ（Server Component）で組み立て、OutfitTimeline（Client）が受け取る。
 */

export type ThumbItem = { name: string; imageUrl: string | null };

export type OutfitEntry = {
  id: string;
  memo: string | null;
  items: ThumbItem[];
};

export type TimelineDay = {
  /** 日付ジャンプの照合キー（YYYY-MM-DD・ローカル時刻基準） */
  date: string;
  /** 2桁の日。「08」のように前ゼロ付き */
  dayNumber: string;
  /** 「8月・金」形式の補足 */
  monthWeekday: string;
  entries: OutfitEntry[];
};
