import type { ReactElement } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { SignupForm } from "@/components/features/auth/SignupForm";

import styles from "./page.module.css";

export default function SignupPage(): ReactElement {
  // サインアップ封鎖時はページごと隠す。API 側は auth.ts の disableSignUp が塞ぐ
  if (process.env.AUTH_DISABLE_SIGNUP === "true") {
    notFound();
  }

  return (
    <>
      <SignupForm />
      <p className={styles.switch}>
        すでにアカウントをお持ちの方は
        <Link className={styles.link} href="/login">
          ログイン
        </Link>
      </p>
    </>
  );
}
