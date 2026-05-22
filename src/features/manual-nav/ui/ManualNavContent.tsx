import type { RefObject } from "react";

import { RecentVisitsSection } from "@/features/recent-visits/ui/RecentVisitsSection";
import { CategoryLayoutShell } from "@/shared/ui/standard-page/CategoryLayoutShell";
import {
  StandardPageLinksContent,
  type StandardPageLinksContentActions,
  type StandardPageLinksContentView,
} from "@/shared/ui/standard-page/StandardPageLinksContent";
import type { Category } from "@/shared/types/category";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

import { ManualNavCategoryBar } from "./ManualNavCategoryBar";

type ManualNavContentView = {
  recentVisits: {
    historyAvailable: boolean;
    show: boolean;
    items: RecentVisitItem[];
    rows: number;
    cardSize: number;
  };
  categoryBar: {
    zoneId: string;
    containerRef: RefObject<HTMLDivElement>;
    navRef: RefObject<HTMLDivElement>;
    categories: Category[];
    layout: "top" | "left" | "all";
    activeCategoryId: string;
    dragSourceCategoryId: string | null;
    editingCategoryId: string | null;
    addCategoryDialogOpen: boolean;
    newCategoryName: string;
  };
  content: StandardPageLinksContentView;
};

type ManualNavContentActions = {
  recentVisits: {
    onRemoveRecentVisit: (recentVisitId: string) => void;
  };
  categoryBar: {
    onSelectCategory: (categoryId: string) => void;
    onStartEditCategory: (categoryId: string | null) => void;
    onRenameCategory: (categoryId: string, newName: string) => void;
    onAddCategoryDialogOpenChange: (open: boolean) => void;
    onNewCategoryNameChange: (value: string) => void;
    onSubmitNewCategory: () => void;
  };
  content: StandardPageLinksContentActions;
};

export type ManualNavContentModel = {
  view: ManualNavContentView;
  actions: ManualNavContentActions;
};

type ManualNavContentProps = {
  model: ManualNavContentModel;
};

export function ManualNavContent({
  model,
}: ManualNavContentProps) {
  const { view, actions } = model;
  const { recentVisits, categoryBar, content } = view;
  const {
    recentVisits: recentVisitsActions,
    categoryBar: categoryBarActions,
    content: contentActions,
  } = actions;
  const categoryLayout = content.mode === "left" ? "left" : "top";

  return (
    <>
      {recentVisits.historyAvailable && recentVisits.show && recentVisits.items.length > 0 ? (
        <RecentVisitsSection
          items={recentVisits.items}
          rows={recentVisits.rows}
          cardSize={recentVisits.cardSize}
          onRemoveItem={recentVisitsActions.onRemoveRecentVisit}
        />
      ) : null}

      {content.mode === "all" ? (
        <StandardPageLinksContent view={content} actions={contentActions} />
      ) : (
        <CategoryLayoutShell
          mode={categoryBar.layout}
          containerRef={categoryBar.containerRef}
          navRef={categoryBar.navRef}
          hasNav={categoryBar.categories.length > 0}
          nav={(
            <ManualNavCategoryBar
              categoryBarZoneId={categoryBar.zoneId}
              categories={categoryBar.categories}
              layout={categoryLayout}
              activeCategoryId={categoryBar.activeCategoryId}
              dragSourceCategoryId={categoryBar.dragSourceCategoryId}
              editingCategoryId={categoryBar.editingCategoryId}
              addCategoryDialogOpen={categoryBar.addCategoryDialogOpen}
              newCategoryName={categoryBar.newCategoryName}
              onSelectCategory={categoryBarActions.onSelectCategory}
              onStartEditCategory={categoryBarActions.onStartEditCategory}
              onRenameCategory={categoryBarActions.onRenameCategory}
              onAddCategoryDialogOpenChange={categoryBarActions.onAddCategoryDialogOpenChange}
              onNewCategoryNameChange={categoryBarActions.onNewCategoryNameChange}
              onSubmitNewCategory={categoryBarActions.onSubmitNewCategory}
            />
          )}
        >
          <StandardPageLinksContent view={content} actions={contentActions} />
        </CategoryLayoutShell>
      )}
    </>
  );
}

