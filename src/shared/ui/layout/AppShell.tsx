import type { ReactNode } from "react";

import { TopNav } from "./TopNav";

export function AppShell({
  title,
  description,
  children,
  hideHeader,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  hideHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-transparent">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {!hideHeader ? (
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  );
}
