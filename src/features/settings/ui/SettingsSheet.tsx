import { useState } from "react";
import { PenLine } from "lucide-react";

import { Accordion } from "@/shared/ui/primitives/accordion";
import { Button } from "@/shared/ui/primitives/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/primitives/sheet";
import { AppearancePanel } from "@/features/appearance";
import { BookmarksManagePanel } from "@/features/bookmarks";
import { CategoryManagePanel, DataManagePanel } from "@/features/manual-nav";
import { QuickEditDialog } from "@/features/quick-edit";

import type { SettingsSheetModel } from "../model/types";
import { LayoutSettingsPanel } from "./LayoutSettingsPanel";
import { SearchSettingsPanel } from "./SearchSettingsPanel";

export function SettingsSheet({
  model,
  trigger,
}: {
  model: SettingsSheetModel;
  trigger: React.ReactNode;
}) {
  const [accordionValue, setAccordionValue] = useState<string>("layout");
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const manualModel = model.kind === "manual" ? model : null;
  const bookmarksModel = model.kind === "bookmarks" ? model : null;

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-[320px] overflow-y-auto scrollbar-transparent">
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
          <SheetDescription className="sr-only">
            应用设置和配置选项
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {manualModel
            && manualModel.categoryManagement.onAddLink
            && manualModel.categoryManagement.onRemoveLink ? (
            <>
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setQuickEditOpen(true)}
              >
                <PenLine className="h-4 w-4 mr-2" />
                快速编辑
              </Button>
              <QuickEditDialog
                open={quickEditOpen}
                onOpenChange={setQuickEditOpen}
                categories={manualModel.categoryManagement.categories}
                onAddLink={manualModel.categoryManagement.onAddLink}
                onRemoveLink={manualModel.categoryManagement.onRemoveLink}
                onUpdateLinkTitle={manualModel.categoryManagement.onUpdateLinkTitle}
                onMoveLink={manualModel.categoryManagement.onMoveLink}
                onCreateCategory={manualModel.categoryManagement.onCreateCategory}
                onDeleteCategory={manualModel.categoryManagement.onDeleteCategory}
              />
            </>
          ) : null}

          <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={(value) => setAccordionValue(value || "")}
            className="space-y-4"
          >
            {manualModel ? (
              <LayoutSettingsPanel
                layout={manualModel.layout.categoryLayout}
                onLayoutChange={manualModel.layout.onCategoryLayoutChange}
                maxVisibleRows={manualModel.layout.maxVisibleRows}
                onMaxVisibleRowsChange={manualModel.layout.onMaxVisibleRowsChange}
                columnsPerRow={manualModel.layout.columnsPerRow}
                onColumnsPerRowChange={manualModel.layout.onColumnsPerRowChange}
              />
            ) : null}

            {bookmarksModel ? (
              <LayoutSettingsPanel
                layout={bookmarksModel.layout.bookmarksLayout}
                onLayoutChange={bookmarksModel.layout.onBookmarksLayoutChange}
                maxVisibleRows={bookmarksModel.layout.maxVisibleRows}
                onMaxVisibleRowsChange={bookmarksModel.layout.onMaxVisibleRowsChange}
                columnsPerRow={bookmarksModel.layout.columnsPerRow}
                onColumnsPerRowChange={bookmarksModel.layout.onColumnsPerRowChange}
              />
            ) : null}

            {manualModel ? (
              <SearchSettingsPanel
                showRecentVisits={manualModel.recentVisits.showRecentVisits}
                onShowRecentVisitsChange={manualModel.recentVisits.onShowRecentVisitsChange}
                recentVisitsRows={manualModel.recentVisits.recentVisitsRows}
                onRecentVisitsRowsChange={manualModel.recentVisits.onRecentVisitsRowsChange}
                recentVisitsCardSize={manualModel.recentVisits.recentVisitsCardSize}
                onRecentVisitsCardSizeChange={manualModel.recentVisits.onRecentVisitsCardSizeChange}
              />
            ) : null}

            <AppearancePanel />

            {manualModel ? (
              <CategoryManagePanel
                categories={manualModel.categoryManagement.categories}
                onCreateCategory={manualModel.categoryManagement.onCreateCategory}
                onDeleteCategory={manualModel.categoryManagement.onDeleteCategory}
                onAddLink={manualModel.categoryManagement.onAddLink}
                onRemoveLink={manualModel.categoryManagement.onRemoveLink}
                onMoveLink={manualModel.categoryManagement.onMoveLink}
              />
            ) : null}

            {bookmarksModel ? <BookmarksManagePanel /> : null}

            {manualModel ? (
              <DataManagePanel
                state={manualModel.dataManagement.state}
                onImport={manualModel.dataManagement.onImport}
              />
            ) : null}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
