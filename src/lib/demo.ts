/**
 * デモアカウント（ポートフォリオ閲覧用）の判定。
 *
 * auth.ts と actionSession.ts の両方から使うため独立させている
 * （actionSession は auth を import しており、auth 側からは循環になるため）。
 * DEMO_USER_EMAIL 未設定ならデモ判定は常に false（通常運用のまま）。
 */
export function isDemoEmail(email: string): boolean {
  const demoEmail = process.env.DEMO_USER_EMAIL ?? "";

  return demoEmail !== "" && email === demoEmail;
}
