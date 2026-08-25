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
      <LoginForm />
      {/*
        デモと新規登録はログインの脇役。狭い画面ではクローゼットの外
        （台輪の下）に出し、線画と文字が重ならないようにする。
      */}
      <div className={styles.footer}>
        {isDemoConfigured() && (
          <form className={styles.demo} action={demoLoginAction}>
            <button type="submit" className={styles.demoLink}>
              デモを見る
            </button>
          </form>
        )}
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
