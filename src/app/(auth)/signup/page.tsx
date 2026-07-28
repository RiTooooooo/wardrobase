import type { ReactElement } from "react";

import Link from "next/link";

import { SignupForm } from "@/components/features/auth/SignupForm";

import styles from "./page.module.css";

export default function SignupPage(): ReactElement {
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
