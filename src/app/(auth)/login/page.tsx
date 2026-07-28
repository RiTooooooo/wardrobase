import type { ReactElement } from "react";

import Link from "next/link";

import { LoginForm } from "@/components/features/auth/LoginForm";

import styles from "./page.module.css";

export default function LoginPage(): ReactElement {
  return (
    <>
      <LoginForm />
      <p className={styles.switch}>
        アカウントをお持ちでない方は
        <Link className={styles.link} href="/signup">
          新規登録
        </Link>
      </p>
    </>
  );
}
