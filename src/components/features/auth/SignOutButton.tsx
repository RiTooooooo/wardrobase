"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import { useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";

import styles from "./SignOutButton.module.css";

export function SignOutButton(): ReactElement {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut(): Promise<void> {
    setIsPending(true);
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className={styles.button}
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
    >
      ログアウト
    </button>
  );
}
