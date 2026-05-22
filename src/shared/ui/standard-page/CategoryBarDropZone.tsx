import { useDroppable } from "@dnd-kit/core";

export function CategoryBarDropZone({
  id,
  children,
}: {
  id: string;
  children: (opts: { setNodeRef: (el: HTMLElement | null) => void }) => React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
    data: { type: "category-bar-zone" },
  });

  return <>{children({ setNodeRef })}</>;
}
