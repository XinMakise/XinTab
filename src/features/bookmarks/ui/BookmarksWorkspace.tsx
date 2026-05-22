import type { ComponentProps, RefObject } from "react";

import { DndContext } from "@dnd-kit/core";

import { CategoryLayoutShell } from "@/shared/ui/standard-page/CategoryLayoutShell";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import { BookmarksCategoryNav, type BookmarksCategoryNavProps } from "./BookmarksCategoryNav";
import { BookmarksContent, type BookmarksContentModel } from "./BookmarksContent";
import { BookmarksDragOverlay } from "./BookmarksDragOverlay";

type BookmarksWorkspaceProps = Pick<
  ComponentProps<typeof DndContext>,
  "sensors" | "collisionDetection" | "onDragStart" | "onDragOver" | "onDragEnd" | "onDragCancel"
> & {
  error: string | null;
  loading: boolean;
  layout: "top" | "left" | "all";
  categories: Category[];
  categoryBarRef: RefObject<HTMLDivElement>;
  categoryNavRef: RefObject<HTMLDivElement>;
  categoryNavProps: BookmarksCategoryNavProps;
  contentModel: BookmarksContentModel;
  activeDragLink: SiteLink | null;
  activeDragCategory: Category | null;
  dragOverlayModifiers?: ComponentProps<typeof BookmarksDragOverlay>["modifiers"];
};

export function BookmarksWorkspace({
  error,
  loading,
  layout,
  categories,
  categoryBarRef,
  categoryNavRef,
  categoryNavProps,
  contentModel,
  activeDragLink,
  activeDragCategory,
  dragOverlayModifiers,
  ...dndProps
}: BookmarksWorkspaceProps) {
  const contentNode = <BookmarksContent model={contentModel} />;

  return (
    <DndContext {...dndProps}>
      {!error && !loading ? (
        <CategoryLayoutShell
          mode={layout}
          containerRef={categoryBarRef}
          navRef={categoryNavRef}
          hasNav={categories.length > 0}
          nav={<BookmarksCategoryNav {...categoryNavProps} />}
          containerClassName="min-h-[calc(100vh-12rem)]"
          allWrapperClassName="min-h-[calc(100vh-12rem)]"
        >
          {contentNode}
        </CategoryLayoutShell>
      ) : contentNode}

      <BookmarksDragOverlay
        activeDragLink={activeDragLink}
        activeDragCategory={activeDragCategory}
        modifiers={dragOverlayModifiers ?? []}
      />
    </DndContext>
  );
}

