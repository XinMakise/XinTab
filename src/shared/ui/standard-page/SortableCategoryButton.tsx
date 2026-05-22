import React, { useState, useRef, useEffect } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { cn } from "@/shared/lib/cn";

export interface SortableCategoryButtonProps {
  id: string;
  name: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  layout: "top" | "left" | "all";
  isDragSource?: boolean;
  droppable?: boolean;
  droppableIdPrefix?: string;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onRename?: (newName: string) => void;
}

export const SortableCategoryButton = React.memo(function SortableCategoryButton({
  id,
  name,
  count,
  isActive,
  isDragSource,
  onClick,
  layout,
  droppable = true,
  droppableIdPrefix = "cat-btn:",
  isEditing = false,
  onStartEdit,
  onRename,
}: SortableCategoryButtonProps) {
  const { active } = useDndContext();
  const [editValue, setEditValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(name);
  }, [name]);

  const handleSubmitEdit = () => {
    if (editValue.trim() && onRename) {
      onRename(editValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitEdit();
    } else if (e.key === "Escape") {
      setEditValue(name);
      onRename?.(name);
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "category-button" },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `${droppableIdPrefix}${id}`,
    data: { type: "container", categoryId: id },
    disabled: !droppable,
  });

  const isDraggingLink = !!active && active.data.current?.type !== "category-button";
  const isDragSourceActive = isDragSource && isDraggingLink;
  const isDropTargetActive = isOver && droppable && isDraggingLink;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const wrapperClassName = cn(
    "p-1",
    layout === "left" ? "w-full" : "shrink-0",
    isDraggingLink && "cursor-grabbing",
  );

  const buttonClassName = cn(
    "transition-[box-shadow,opacity,background-color,color] duration-150",
    layout === "left" ? "w-full justify-between" : "min-w-[6.5rem] justify-center",
    isDraggingLink && "pointer-events-none",
    isDragging && "opacity-0 ring-2 ring-dashed ring-muted-foreground/50",
    isDragSourceActive && "ring-2 ring-dashed ring-muted-foreground/50 opacity-60",
    isDropTargetActive && "ring-2 ring-primary/80 shadow-[0_0_0_5px_hsl(var(--primary)/0.16)]",
  );

  const buttonStyle: React.CSSProperties = {
    backgroundColor: isActive
      ? "hsl(var(--primary) / var(--app-category-button-opacity, 1))"
      : "hsl(var(--secondary) / var(--app-category-button-opacity, 1))",
    color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--secondary-foreground))",
  };

  const countStyle: React.CSSProperties = {
    backgroundColor: "hsl(var(--muted) / var(--app-category-button-opacity, 1))",
  };

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        if (droppable) setDroppableRef(node);
      }}
      data-category-id={id}
      className={wrapperClassName}
      style={style}
      {...(isDraggingLink || isEditing ? {} : attributes)}
      {...(isDraggingLink || isEditing ? {} : listeners)}
    >
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmitEdit}
          onKeyDown={handleKeyDown}
          className="h-9 min-w-[80px] max-w-[150px]"
        />
      ) : (
        <Button
          variant={isActive ? "default" : "secondary"}
          className={buttonClassName}
          style={buttonStyle}
          onClick={onClick}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartEdit?.();
          }}
        >
          <span className="truncate">{name}</span>
          {count > 0 ? (
            <span
              className="ml-2 rounded-sm px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground"
              style={countStyle}
            >
              {count}
            </span>
          ) : null}
        </Button>
      )}
    </div>
  );
});


