import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { storage } from "@/shared/browser/storage";
import { useDebouncedCallback } from "@/shared/lib/hooks/useDebounce";
import type { ManualNavState } from "@/shared/types/manual-nav";

import {
  DEFAULT_MANUAL_NAV_STATE,
  MANUAL_NAV_STORAGE_KEY,
  mergeLoadedManualNavState,
} from "./manualNavStateShared";

type UseManualNavImportExportOptions = {
  setActiveCategoryId: Dispatch<SetStateAction<string>>;
};

export function useManualNavImportExport({
  setActiveCategoryId,
}: UseManualNavImportExportOptions) {
  const [state, setState] = useState<ManualNavState>(DEFAULT_MANUAL_NAV_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const saved = await storage.get<ManualNavState>(MANUAL_NAV_STORAGE_KEY);
        if (mounted && saved?.categories?.length) {
          const nextState = mergeLoadedManualNavState(saved);
          setState(nextState);
          setActiveCategoryId(nextState.categories[0].id);
        }
      } catch (error) {
        console.warn("Failed to load manual nav state", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setActiveCategoryId]);

  const debouncedPersist = useDebouncedCallback((data: ManualNavState) => {
    storage.set(MANUAL_NAV_STORAGE_KEY, data).catch((error) => {
      console.warn("Failed to persist manual nav state", error);
    });
  }, 300);

  useEffect(() => {
    if (loading) return;
    debouncedPersist(state);
  }, [debouncedPersist, loading, state]);

  const handleImport = useCallback((newState: ManualNavState) => {
    setState(newState);
  }, []);

  return {
    state,
    setState,
    loading,
    handleImport,
  };
}
