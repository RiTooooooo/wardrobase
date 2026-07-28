"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signUp } from "@/lib/auth-client";
import { toFieldErrors } from "@/lib/formErrors";
import { signupSchema } from "@/schemas/auth";

import styles from "./SignupForm.module.css";

/**
 * 登録済みメールアドレスであることを明示している。
 * better-auth の API が USER_ALREADY_EXISTS を返す以上、UI で伏せても
 * アカウント列挙は防げない（API を直接叩けば分かる）ため、
 * 防げない秘匿より利用者の分かりやすさを優先する。
 * 列挙を本気で防ぐならメール送信を挟む方式が必要で、それは Phase 2 以降の課題。
 */
function toSignupErrorMessage(code: string | undefined): string {
  if (code === "USER_ALREADY_EXISTS") {
    return "このメールアドレスは既に登録されています";
  }
  return "登録できませんでした。時間をおいて再度お試しください";
}

export function SignupForm(): ReactElement {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError("");
    setIsDuplicate(false);

    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsPending(true);
    const { error } = await signUp.email(parsed.data);
    setIsPending(false);

    if (error) {
      setFormError(toSignupErrorMessage(error.code));
      setIsDuplicate(error.code === "USER_ALREADY_EXISTS");
      return;
    }

    router.push("/wardrobe");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        id="name"
        name="name"
        label="名前"
        type="text"
        autoComplete="name"
        error={fieldErrors.name}
        disabled={isPending}
      />
      <TextField
        id="email"
        name="email"
        label="メールアドレス"
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
        disabled={isPending}
      />
      <TextField
        id="password"
        name="password"
        label="パスワード"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
        disabled={isPending}
      />
      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
          {isDuplicate ? (
            <Link className={styles.errorLink} href="/login">
              ログインする
            </Link>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "登録中" : "アカウントを作成"}
      </Button>
    </form>
  );
}
