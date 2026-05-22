import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

type QuickEditCreateCategoryRowProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function QuickEditCreateCategoryRow({
  value,
  onValueChange,
  onSubmit,
  onCancel,
}: QuickEditCreateCategoryRowProps) {
  return (
    <div className="mb-2 flex gap-1">
      <Input
        placeholder="新分类名称"
        className="h-8 text-xs"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSubmit();
          if (event.key === "Escape") onCancel();
        }}
      />
      <Button
        size="sm"
        className="h-8 px-2 text-xs shrink-0"
        disabled={!value.trim()}
        onClick={onSubmit}
      >
        添加
      </Button>
    </div>
  );
}

