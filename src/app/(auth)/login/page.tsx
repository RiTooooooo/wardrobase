import type { ReactElement } from "react";

import Link from "next/link";

import { LoginForm } from "@/components/features/auth/LoginForm";

import { isSignupOpen } from "@/lib/signupPolicy";

import { demoLoginAction } from "./demoActions";
import styles from "./page.module.css";

function isDemoConfigured(): boolean {
  return (
    (process.env.DEMO_USER_EMAIL ?? "") !== "" &&
    (process.env.DEMO_USER_PASSWORD ?? "") !== ""
  );
}

export default function LoginPage(): ReactElement {
  const signupDisabled = !isSignupOpen();

  return (
    <>
      {/*
        アカウントを持たない訪問者にはデモが主要な入り口。
        ログイン（塗り）の隣に枠線ボタンとして1列に並べる。
      */}
      <LoginForm
        secondaryAction={
          isDemoConfigured() ? (
            <form className={styles.demo} action={demoLoginAction}>
              <button type="submit" className={styles.demoButton}>
                デモを見る
              </button>
            </form>
          ) : undefined
        }
      />
      <div className={styles.footer}>
        {!signupDisabled && (
          <p className={styles.switch}>
            アカウントをお持ちでない方は
            <Link className={styles.link} href="/signup">
              新規登録
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
