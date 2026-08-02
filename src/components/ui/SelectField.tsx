import type { ReactElement } from "react";

import { FieldError } from "./FieldError";
import { fieldErrorAria } from "./fieldA11y";
import styles from "./SelectField.module.css";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  options: readonly Option[];
  placeholder: string;
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export function SelectField({
  id,
  name,
  label,
  options,
  placeholder,
  defaultValue,
  error,
  disabled,
  onChange,
}: SelectFieldProps): ReactElement {
  const errorId = `${id}-error`;
  const className = error
    ? `${styles.select} ${styles.selectError}`
    : styles.select;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <select
        className={className}
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        {...fieldErrorAria(errorId, error)}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}
