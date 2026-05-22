import type { Dispatch, SetStateAction } from "react";

import { useManualNavCategories } from "./useManualNavCategories";
import { useManualNavImportExport } from "./useManualNavImportExport";
import { useManualNavSettings } from "./useManualNavSettings";

export function useManualNavState({
  setActiveCategoryId,
}: {
  setActiveCategoryId: Dispatch<SetStateAction<string>>;
}) {
  const { state, setState, loading, handleImport } = useManualNavImportExport({
    setActiveCategoryId,
  });
  const categoryModel = useManualNavCategories({
    state,
    setState,
    setActiveCategoryId,
  });
  const settingsModel = useManualNavSettings({
    state,
    setState,
  });

  return {
    state,
    setState,
    loading,
    ...categoryModel,
    handleImport,
    ...settingsModel,
  };
}
