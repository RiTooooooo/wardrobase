/**
 * 入力欄のエラー用 ARIA 属性。
 *
 * 各フィールドで三項演算子を並べると complexity 上限に当たるため、
 * ここにまとめて分岐を1箇所に閉じ込める。
 */
export interface FieldAria {
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function fieldErrorAria(
  errorId: string,
  error: string | undefined,
): FieldAria {
  if (error === undefined) {
    return {};
  }

  return { "aria-invalid": true, "aria-describedby": errorId };
}
