import type { ReactElement } from "react";

import styles from "./TextField.module.css";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete?: string;
  error?: string;
  disabled?: boolean;
}

export function TextField({
  id,
  name,
  label,
  type,
  autoComplete,
  error,
  disabled,
}: TextFieldProps): ReactElement {
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={error ? `${styles.input} ${styles.inputError}` : styles.input}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
