import type { ZodError } from "zod";

/**
 * Zod のエラーを「フィールド名 → 最初のメッセージ」の形に変換する。
 * 同じフィールドに複数のエラーがある場合は最初のものだけを表示する。
 */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in result)) {
      result[key] = issue.message;
    }
  }

  return result;
}
