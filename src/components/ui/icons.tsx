import type { ReactElement, ReactNode } from "react";

/*
 * 操作に添える機能的なアイコン（装飾用途では使わない）。
 * 線の太さ・角の丸めを揃え、必ずラベルか aria-label と対で使う。
 */

function IconBase({
  size,
  strokeWidth,
  children,
}: {
  size: number;
  strokeWidth: number;
  children: ReactNode;
}): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconPlus({ size = 16 }: { size?: number }): ReactElement {
  return (
    <IconBase size={size} strokeWidth={2.2}>
      <path d="M12 5 L12 19" />
      <path d="M5 12 L19 12" />
    </IconBase>
  );
}

export function IconSearch({ size = 19 }: { size?: number }): ReactElement {
  return (
    <IconBase size={size} strokeWidth={1.8}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16 L20.5 20.5" />
    </IconBase>
  );
}

export function IconCalendar({ size = 19 }: { size?: number }): ReactElement {
  return (
    <IconBase size={size} strokeWidth={1.8}>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10.5 L20 10.5" />
      <path d="M9 4 L9 8" />
      <path d="M15 4 L15 8" />
    </IconBase>
  );
}

export function IconChevronRight({
  size = 18,
}: {
  size?: number;
}): ReactElement {
  return (
    <IconBase size={size} strokeWidth={1.8}>
      <path d="M9 6 L15 12 L9 18" />
    </IconBase>
  );
}

/* お気に入り度の星。filled は塗り、未満は線だけで描く */
export function IconStar({
  size = 18,
  filled = false,
}: {
  size?: number;
  filled?: boolean;
}): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.8 L14.8 8.4 L21 9.3 L16.5 13.7 L17.6 19.9 L12 17 L6.4 19.9 L7.5 13.7 L3 9.3 L9.2 8.4 Z" />
    </svg>
  );
}
