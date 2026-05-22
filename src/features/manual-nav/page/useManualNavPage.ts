import { useEffect, useMemo, useState, type ComponentProps } from "react";

import { useManualNavPageDialogsState } from "@/features/manual-nav/model/useManualNavPageDialogsState";
import { useManualNavState } from "@/features/manual-nav/model/useManualNavState";
import { useManualNavWorkspaceProps } from "@/features/manual-nav/model/useManualNavWorkspaceProps";
import {
  estimateRecentVisitsContentWidth,
  getRecentVisitsVisibleCount,
  normalizeRecentVisitsLimit,
  useRecentVisits,
} from "@/features/recent-visits";
import {
  useManualNavSettingsSheetModel,
  type ManualNavSettingsSheetProps,
} from "@/features/settings";
import { useCategoryPanelState } from "@/shared/lib/hooks/useCategoryPanelState";

import { ManualNavPageDialogs } from "../ui/ManualNavPageDialogs";
import { ManualNavWorkspace } from "../ui/ManualNavWorkspace";

export function useManualNavPage(): {
  workspaceProps: ComponentProps<typeof ManualNavWorkspace>;
  settingsSheetProps: ManualNavSettingsSheetProps;
  dialogsProps: ComponentProps<typeof ManualNavPageDialogs>;
} {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("quick");
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  const {
    state,
    setState,
    categoryById,
    categoryLayout,
    columnsPerRow,
    showRecentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    hiddenRecentVisitIds,
    createCategory,
    renameCategory,
    onAddLink,
    onRemoveLink,
    onUpdateLink,
    onUpdateLinkTitle,
    addRecentVisitToCategory,
    handleImport,
    handleDeleteCategoryFromSettings,
    handleCategoryLayoutChange,
    handleMaxVisibleRowsChange,
    handleColumnsPerRowChange,
    handleShowRecentVisitsChange,
    handleRecentVisitsRowsChange,
    handleRecentVisitsCardSizeChange,
    handleHideRecentVisit,
  } = useManualNavState({ setActiveCategoryId });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const recentVisitsCount = useMemo(
    () => normalizeRecentVisitsLimit(
      getRecentVisitsVisibleCount(
        estimateRecentVisitsContentWidth(viewportWidth),
        recentVisitsRows,
        recentVisitsCardSize,
      ),
    ),
    [recentVisitsCardSize, recentVisitsRows, viewportWidth],
  );

  const { panelState, panelActions } = useCategoryPanelState({
    onCreateCategory: createCategory,
    onRenameCategory: renameCategory,
  });

  // Keep one spare visit loaded so removing a card can backfill immediately.
  const recentVisitsFetchCount = recentVisitsCount + hiddenRecentVisitIds.length + 1;
  const { recentVisits: loadedRecentVisits, historyAvailable } = useRecentVisits({
    enabled: showRecentVisits,
    count: recentVisitsFetchCount,
  });
  const recentVisits = loadedRecentVisits
    .filter((item) => !hiddenRecentVisitIds.includes(item.id))
    .slice(0, recentVisitsCount);

  const { setEditingLink, dialogsProps } = useManualNavPageDialogsState({
    onSaveLink: onUpdateLink,
  });

  const { workspaceProps, moveLink } = useManualNavWorkspaceProps({
    state,
    setState,
    categoryById,
    activeCategoryId,
    setActiveCategoryId,
    categoryLayout,
    columnsPerRow,
    maxVisibleRows: state.ui?.maxVisibleRows ?? 3,
    panelState,
    panelActions,
    recentVisits,
    historyAvailable,
    showRecentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    onHideRecentVisit: handleHideRecentVisit,
    addRecentVisitToCategory,
    onRemoveLink,
    onEditLink: setEditingLink,
    onAddLink,
  });

  const settingsSheetProps = useManualNavSettingsSheetModel({
    categories: state.categories,
    state,
    categoryLayout,
    columnsPerRow,
    maxVisibleRows: state.ui?.maxVisibleRows ?? 3,
    showRecentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    onCreateCategory: createCategory,
    onDeleteCategory: handleDeleteCategoryFromSettings,
    onAddLink,
    onRemoveLink,
    onUpdateLinkTitle,
    onMoveLink: moveLink,
    onImport: handleImport,
    onCategoryLayoutChange: handleCategoryLayoutChange,
    onMaxVisibleRowsChange: handleMaxVisibleRowsChange,
    onColumnsPerRowChange: handleColumnsPerRowChange,
    onShowRecentVisitsChange: handleShowRecentVisitsChange,
    onRecentVisitsRowsChange: handleRecentVisitsRowsChange,
    onRecentVisitsCardSizeChange: handleRecentVisitsCardSizeChange,
  });

  return {
    workspaceProps,
    settingsSheetProps,
    dialogsProps,
  };
}

