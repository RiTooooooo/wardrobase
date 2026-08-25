import type { ReactElement } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { SignupForm } from "@/components/features/auth/SignupForm";
import { isSignupOpen } from "@/lib/signupPolicy";

import styles from "./page.module.css";

export default function SignupPage(): ReactElement {
  // サインアップ封鎖時はページごと隠す。API 側は auth.ts の disableSignUp が塞ぐ
  // （本番は常時封鎖。判定は signupPolicy.ts に集約）
  if (!isSignupOpen()) {
    notFound();
  }

  return (
    <>
      <SignupForm />
      {/* 狭い画面ではクローゼットの外（台輪の下）に出す。ログイン画面と同じ */}
      <div className={styles.footer}>
        <p className={styles.switch}>
          すでにアカウントをお持ちの方は
          <Link className={styles.link} href="/login">
            ログイン
          </Link>
        </p>
      </div>
    </>
  );
}
