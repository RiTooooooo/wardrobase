import type { ReactElement } from "react";

import styles from "./FieldError.module.css";

interface FieldErrorProps {
  id: string;
  message: string | undefined;
}

export function FieldError({ id, message }: FieldErrorProps): ReactElement | null {
  if (message === undefined) {
    return null;
  }

  return (
    <p className={styles.error} id={id}>
      {message}
    </p>
  );
}
