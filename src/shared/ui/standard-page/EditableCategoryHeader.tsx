import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";

type EditableCategoryHeaderProps = {
  categoryId: string;
  name: string;
  count: number;
  isEditing: boolean;
  onStartEdit: (categoryId: string) => void;
  onFinishEdit: (categoryId: string, newName: string) => void;
  onCancelEdit: () => void;
};

export function EditableCategoryHeader({
  categoryId,
  name,
  count,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
}: EditableCategoryHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <Input
          autoFocus
          defaultValue={name}
          className="h-9 w-auto min-w-[80px] max-w-[200px]"
          onBlur={(event) => onFinishEdit(categoryId, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onFinishEdit(categoryId, event.currentTarget.value);
            } else if (event.key === "Escape") {
              onCancelEdit();
            }
          }}
        />
      ) : (
        <Button
          variant="default"
          size="sm"
          onDoubleClick={() => onStartEdit(categoryId)}
        >
          <span className="truncate">{name}</span>
          {count > 0 ? (
            <span className="ml-2 rounded-sm bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] leading-none">
              {count}
            </span>
          ) : null}
        </Button>
      )}
    </div>
  );
}

