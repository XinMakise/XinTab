import type { ReactNode } from "react";

type QuickEditPaneMessageProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
};

export function QuickEditPaneMessage({
  icon,
  title,
  description,
}: QuickEditPaneMessageProps) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="text-center text-sm text-muted-foreground space-y-2">
        {icon}
        <p>{title}</p>
        {description ? <p className="text-xs">{description}</p> : null}
      </div>
    </div>
  );
}
