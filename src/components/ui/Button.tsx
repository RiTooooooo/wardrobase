import type { ReactElement, ReactNode } from "react";

import styles from "./Button.module.css";

interface ButtonProps {
  type: "button" | "submit";
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  type,
  children,
  disabled,
  onClick,
}: ButtonProps): ReactElement {
  return (
    <button
      className={styles.button}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
