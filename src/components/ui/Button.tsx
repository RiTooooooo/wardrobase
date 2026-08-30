import type { ReactElement, ReactNode } from "react";

import styles from "./Button.module.css";

interface ButtonProps {
  type: "button" | "submit";
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  /** フォームの外に置くとき、送信先のフォーム id を指す（HTML の form 属性） */
  form?: string;
}

export function Button({
  type,
  children,
  disabled,
  onClick,
  form,
}: ButtonProps): ReactElement {
  return (
    <button
      className={styles.button}
      type={type}
      disabled={disabled}
      onClick={onClick}
      form={form}
    >
      {children}
    </button>
  );
}
