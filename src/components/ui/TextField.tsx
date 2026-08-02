import type { ReactElement } from "react";

import { FieldError } from "./FieldError";
import { fieldErrorAria } from "./fieldA11y";
import styles from "./TextField.module.css";

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "date";
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
}

export function TextField({
  id,
  name,
  label,
  type,
  autoComplete,
  placeholder,
  defaultValue,
  optional,
  error,
  disabled,
}: TextFieldProps): ReactElement {
  const errorId = `${id}-error`;
  const className = error ? `${styles.input} ${styles.inputError}` : styles.input;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional ? <span className={styles.optional}>任意</span> : null}
      </label>
      <input
        className={className}
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        {...fieldErrorAria(errorId, error)}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
