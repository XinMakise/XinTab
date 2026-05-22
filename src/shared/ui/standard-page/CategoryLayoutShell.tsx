import type { ReactNode, Ref } from "react";

import { cn } from "@/shared/lib/cn";

type CategoryLayoutMode = "top" | "left" | "all";

interface CategoryLayoutShellProps {
  mode: CategoryLayoutMode;
  hasNav: boolean;
  nav: ReactNode;
  children: ReactNode;
  containerRef?: Ref<HTMLDivElement>;
  navRef?: Ref<HTMLDivElement>;
  containerClassName?: string;
  topNavClassName?: string;
  leftNavClassName?: string;
  contentWrapperClassName?: string;
  allWrapperClassName?: string;
}

export function CategoryLayoutShell({
  mode,
  hasNav,
  nav,
  children,
  containerRef,
  navRef,
  containerClassName,
  topNavClassName,
  leftNavClassName,
  contentWrapperClassName,
  allWrapperClassName,
}: CategoryLayoutShellProps) {
  if (mode === "all") {
    return allWrapperClassName ? <div className={allWrapperClassName}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={cn(mode === "left" ? "flex gap-4" : "space-y-4", containerClassName)}
    >
      {hasNav && mode === "top" ? (
        <div
          ref={navRef}
          className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-transparent", topNavClassName)}
        >
          {nav}
        </div>
      ) : null}

      {hasNav && mode === "left" ? (
        <div
          ref={navRef}
          className={cn(
            "flex shrink-0 flex-col gap-2 overflow-y-auto scrollbar-transparent max-h-[calc(100vh-12rem)] sticky top-0 self-start",
            leftNavClassName,
          )}
          style={{
            width: "var(--app-left-category-width, 192px)",
            flexBasis: "var(--app-left-category-width, 192px)",
          }}
        >
          {nav}
        </div>
      ) : null}

      <div className={cn(mode === "left" ? "min-w-0 flex-1" : "", contentWrapperClassName)}>
        {children}
      </div>
    </div>
  );
}

