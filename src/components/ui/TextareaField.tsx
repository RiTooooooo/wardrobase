import type { ReactElement } from "react";

import { FieldError } from "./FieldError";
import { fieldErrorAria } from "./fieldA11y";
import styles from "./TextareaField.module.css";

interface TextareaFieldProps {
  id: string;
  name: string;
  label: string;
  rows?: number;
  defaultValue?: string;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
}

export function TextareaField({
  id,
  name,
  label,
  rows,
  defaultValue,
  optional,
  error,
  disabled,
}: TextareaFieldProps): ReactElement {
  const errorId = `${id}-error`;
  const className = error
    ? `${styles.textarea} ${styles.textareaError}`
    : styles.textarea;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional ? <span className={styles.optional}>任意</span> : null}
      </label>
      <textarea
        className={className}
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        disabled={disabled}
        {...fieldErrorAria(errorId, error)}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
