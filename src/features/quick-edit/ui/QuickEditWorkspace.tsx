import type { ComponentProps } from "react";

import { DndContext } from "@dnd-kit/core";

import { QuickEditPanels } from "@/features/quick-edit/ui/QuickEditPanels";
import { QuickEditDragOverlay } from "@/features/quick-edit/ui/quick-edit/QuickEditDragOverlay";
import type { SiteLink } from "@/shared/types/link";

type QuickEditWorkspaceProps = Pick<
  ComponentProps<typeof DndContext>,
  "sensors" | "collisionDetection" | "onDragStart" | "onDragOver" | "onDragEnd" | "onDragCancel"
> &
  ComponentProps<typeof QuickEditPanels> & {
    activeDragItem: SiteLink | null;
  };

export function QuickEditWorkspace({
  activeDragItem,
  ...props
}: QuickEditWorkspaceProps) {
  const {
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    ...panelProps
  } = props;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <QuickEditPanels {...panelProps} />
      <QuickEditDragOverlay activeDragItem={activeDragItem} />
    </DndContext>
  );
}

