import { useDroppable } from "@dnd-kit/core";

export function CategoryDropTarget({
  id,
  children,
}: {
  id: string;
  children: (opts: { isOver: boolean; setNodeRef: (el: HTMLElement | null) => void }) => React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { type: "container" } });
  return <>{children({ isOver, setNodeRef })}</>;
}
