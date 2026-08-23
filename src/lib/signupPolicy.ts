/**
 * サインアップの開閉ポリシー。
 *
 * 本番アカウントは管理スクリプト（prisma/create-user.ts）で作る方針のため、
 * 本番ビルドでは環境変数に関係なく常に封鎖する。
 * 開発環境でも AUTH_ALLOW_SIGNUP=true を明示したときだけ開く（fail-closed）。
 * API 側（auth.ts の disableSignUp）と画面側（ログイン・サインアップページ）の
 * 両方がこの判定を使い、挙動が食い違わないようにする。
 */
export function isSignupOpen(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_ALLOW_SIGNUP === "true"
  );
}

/**
 * サインアップを許可するメールアドレスのポリシー。
 *
 * AUTH_ALLOW_SIGNUP=true で登録を開いている間も、
 * AUTH_SIGNUP_ALLOWED_EMAILS（カンマ区切り）に載っているアドレスしか
 * 登録できないようにする。第三者の登録を防ぐ二段目の錠前。
 *
 * - 未設定・空なら誰も登録できない（fail-closed）
 * - "*" を含めると全アドレスを許可（ローカル開発用）
 */
export function isSignupEmailAllowed(email: string): boolean {
  const raw = process.env.AUTH_SIGNUP_ALLOWED_EMAILS ?? "";
  const entries = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value !== "");

  if (entries.includes("*")) return true;

  return entries.includes(email.toLowerCase());
}
