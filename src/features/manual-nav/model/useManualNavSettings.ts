import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  normalizeRecentVisitsCardSize,
  normalizeRecentVisitsRows,
} from "@/features/recent-visits";
import type { ManualNavState } from "@/shared/types/manual-nav";

import { normalizeHiddenRecentVisitIds } from "./manualNavStateShared";

type UseManualNavSettingsOptions = {
  state: ManualNavState;
  setState: Dispatch<SetStateAction<ManualNavState>>;
};

export function useManualNavSettings({
  state,
  setState,
}: UseManualNavSettingsOptions) {
  const categoryLayout = state.ui?.categoryLayout ?? "top";
  const columnsPerRow = state.ui?.columnsPerRow ?? 5;
  const showRecentVisits = state.ui?.showRecentVisits ?? true;
  const recentVisitsRows = normalizeRecentVisitsRows(
    state.ui?.recentVisitsRows,
    state.ui?.recentVisitsCount,
  );
  const recentVisitsCardSize = normalizeRecentVisitsCardSize(state.ui?.recentVisitsCardSize);
  const hiddenRecentVisitIds = normalizeHiddenRecentVisitIds(state.ui?.hiddenRecentVisitIds);

  const handleCategoryLayoutChange = useCallback((layout: "top" | "left" | "all") => {
    setState((prev) => ({
      ...prev,
      ui: { ...(prev.ui ?? {}), categoryLayout: layout },
    }));
  }, [setState]);

  const handleMaxVisibleRowsChange = useCallback((rows: number) => {
    setState((prev) => ({
      ...prev,
      ui: { ...(prev.ui ?? {}), maxVisibleRows: rows },
    }));
  }, [setState]);

  const handleColumnsPerRowChange = useCallback((columns: number) => {
    setState((prev) => ({
      ...prev,
      ui: { ...(prev.ui ?? {}), columnsPerRow: columns },
    }));
  }, [setState]);

  const handleShowRecentVisitsChange = useCallback((checked: boolean) => {
    setState((prev) => ({
      ...prev,
      ui: { ...(prev.ui ?? {}), showRecentVisits: checked },
    }));
  }, [setState]);

  const handleRecentVisitsRowsChange = useCallback((rows: number) => {
    setState((prev) => ({
      ...prev,
      ui: {
        ...(prev.ui ?? {}),
        recentVisitsRows: normalizeRecentVisitsRows(rows),
      },
    }));
  }, [setState]);

  const handleRecentVisitsCardSizeChange = useCallback((size: number) => {
    setState((prev) => ({
      ...prev,
      ui: { ...(prev.ui ?? {}), recentVisitsCardSize: normalizeRecentVisitsCardSize(size) },
    }));
  }, [setState]);

  const handleHideRecentVisit = useCallback((recentVisitId: string) => {
    setState((prev) => {
      const hiddenIds = normalizeHiddenRecentVisitIds(prev.ui?.hiddenRecentVisitIds);
      if (hiddenIds.includes(recentVisitId)) {
        return prev;
      }

      return {
        ...prev,
        ui: {
          ...(prev.ui ?? {}),
          hiddenRecentVisitIds: [...hiddenIds, recentVisitId],
        },
      };
    });
  }, [setState]);

  return {
    categoryLayout,
    columnsPerRow,
    showRecentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    hiddenRecentVisitIds,
    handleCategoryLayoutChange,
    handleMaxVisibleRowsChange,
    handleColumnsPerRowChange,
    handleShowRecentVisitsChange,
    handleRecentVisitsRowsChange,
    handleRecentVisitsCardSizeChange,
    handleHideRecentVisit,
  };
}
