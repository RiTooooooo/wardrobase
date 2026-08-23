import type { ReactElement } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
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
      {isDemoConfigured() && (
        <form className={styles.demo} action={demoLoginAction}>
          <Button type="submit">デモを見る</Button>
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
    </>
  );
}
