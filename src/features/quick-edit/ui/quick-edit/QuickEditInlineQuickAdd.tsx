import { Link as LinkIcon } from "lucide-react";

import { Input } from "@/shared/ui/primitives/input";
import { useQuickEditInlineAddState } from "@/features/quick-edit/model/useQuickEditInlineAddState";
import type { SiteLink } from "@/shared/types/link";

type QuickEditInlineQuickAddProps = {
  categoryId: string;
  onAdd: (categoryId: string, link: SiteLink) => void;
};

export function QuickEditInlineQuickAdd({
  categoryId,
  onAdd,
}: QuickEditInlineQuickAddProps) {
  const { value, inputRef, setValue, submit } = useQuickEditInlineAddState({
    categoryId,
    onAdd,
  });

  return (
    <div className="flex items-center gap-1 px-2 py-1">
      <LinkIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
        }}
        placeholder="粘贴 URL 回车快速添加…"
        className="h-6 text-xs py-0 px-1 border-none shadow-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
      />
    </div>
  );
}


