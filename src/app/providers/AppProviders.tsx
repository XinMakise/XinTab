import type { PropsWithChildren } from "react";

import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { Toaster } from "@/shared/ui/primitives/toaster";
import { Toaster as Sonner } from "@/shared/ui/primitives/sonner";
import { TooltipProvider } from "@/shared/ui/primitives/tooltip";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </ErrorBoundary>
  );
}

