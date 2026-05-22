import { forwardRef } from "react";
import { Settings } from "lucide-react";

import { Button, type ButtonProps } from "@/shared/ui/primitives/button";
import { cn } from "@/shared/lib/cn";

export const FloatingSettingsTrigger = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "children" | "aria-label"> & { ariaLabel?: string }
>(({ ariaLabel = "设置", className, type = "button", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      type={type}
      variant="secondary"
      size="icon"
      className={cn("fixed bottom-4 left-4 z-20 shadow-md", className)}
      aria-label={ariaLabel}
      {...props}
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
});

FloatingSettingsTrigger.displayName = "FloatingSettingsTrigger";


