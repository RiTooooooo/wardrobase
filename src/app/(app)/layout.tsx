import type { ReactElement, ReactNode } from "react";

import { AppHeader } from "@/components/features/navigation/AppHeader";

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
