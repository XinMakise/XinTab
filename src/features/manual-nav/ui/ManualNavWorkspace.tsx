import type { ComponentProps } from "react";

import { DndContext } from "@dnd-kit/core";

import type { Category } from "@/shared/types/category";
import type { RecentVisitItem } from "@/shared/types/recent-visit";
import type { SiteLink } from "@/shared/types/link";

import { ManualNavContent, type ManualNavContentModel } from "./ManualNavContent";
import { ManualNavDragOverlay } from "./ManualNavDragOverlay";

type ManualNavWorkspaceProps = Pick<
  ComponentProps<typeof DndContext>,
  "sensors" | "collisionDetection" | "onDragStart" | "onDragOver" | "onDragEnd" | "onDragCancel"
> & {
  contentModel: ManualNavContentModel;
  activeRecentVisit: RecentVisitItem | null;
  activeDragLink: SiteLink | null;
  activeDragCategory: Category | null;
  dragOverlayModifiers?: ComponentProps<typeof ManualNavDragOverlay>["modifiers"];
};

export function ManualNavWorkspace({
  contentModel,
  activeRecentVisit,
  activeDragLink,
  activeDragCategory,
  dragOverlayModifiers,
  ...dndProps
}: ManualNavWorkspaceProps) {
  return (
    <DndContext {...dndProps}>
      <ManualNavContent model={contentModel} />

      <ManualNavDragOverlay
        activeRecentVisit={activeRecentVisit}
        activeDragLink={activeDragLink}
        activeDragCategory={activeDragCategory}
        modifiers={dragOverlayModifiers ?? []}
      />
    </DndContext>
  );
}

