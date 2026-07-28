"use client";

import { useState } from "react";
import type { FormEvent, ReactElement } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signIn } from "@/lib/auth-client";
import { toFieldErrors } from "@/lib/formErrors";
import { loginSchema } from "@/schemas/auth";

import styles from "./LoginForm.module.css";

export function LoginForm(): ReactElement {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsPending(true);
    const { error } = await signIn.email(parsed.data);
    setIsPending(false);

    if (error) {
      // どちらが違うかは教えない（conventions.md §5）
      setFormError("メールアドレスまたはパスワードが違います");
      return;
    }

    router.push("/wardrobe");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
        autoComplete="current-password"
        error={fieldErrors.password}
        disabled={isPending}
      />
      {formError ? (
        <p className={styles.formError} role="alert">
          {formError}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "ログイン中" : "ログイン"}
      </Button>
    </form>
  );
}
