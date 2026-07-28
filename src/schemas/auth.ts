import { z } from "zod";

/**
 * 認証まわりの入力スキーマ。
 *
 * Zod を single source of truth とし、型は z.infer で導出する（conventions.md §9）。
 * クライアントのフォーム検証と、値を受け取る側の検証で同じものを使う。
 */

/** better-auth の既定値に合わせる。ここを変える場合は auth.ts の設定も揃える */
const PASSWORD_MIN_LENGTH = 8;

export const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  .email("メールアドレスの形式が正しくありません");

export const passwordSchema = z
  .string()
  .min(1, "パスワードを入力してください")
  .min(PASSWORD_MIN_LENGTH, `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内で入力してください"),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
