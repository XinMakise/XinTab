import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ManualSettingsSheetModel } from "@/features/settings";
import { useManualNavPage } from "@/features/manual-nav";
import {
  estimateRecentVisitsContentWidth,
  getRecentVisitsVisibleCount,
  normalizeRecentVisitsLimit,
} from "@/features/recent-visits";

const stateStub = {
  categories: [{ id: "quick", name: "常用", links: [] }],
  ui: { maxVisibleRows: 4, hiddenRecentVisitIds: ["visit-hidden"] },
};

const workspacePropsStub = { contentModel: { view: {}, actions: {} } };
const settingsSheetPropsStub = {
  model: {
    kind: "manual",
    categoryManagement: {
      categories: stateStub.categories,
      onCreateCategory: vi.fn(),
      onDeleteCategory: vi.fn(),
      onAddLink: vi.fn(),
      onRemoveLink: vi.fn(),
      onUpdateLinkTitle: vi.fn(),
      onMoveLink: vi.fn(),
    },
    layout: {
      categoryLayout: "top" as const,
      onCategoryLayoutChange: vi.fn(),
      maxVisibleRows: 4,
      onMaxVisibleRowsChange: vi.fn(),
      columnsPerRow: 5,
      onColumnsPerRowChange: vi.fn(),
    },
    recentVisits: {
      showRecentVisits: true,
      onShowRecentVisitsChange: vi.fn(),
      recentVisitsRows: 2,
      onRecentVisitsRowsChange: vi.fn(),
      recentVisitsCardSize: 120,
      onRecentVisitsCardSizeChange: vi.fn(),
    },
    appearance: {},
    dataManagement: {
      state: stateStub,
      onImport: vi.fn(),
    },
  } satisfies ManualSettingsSheetModel,
};
const dialogsPropsStub = { editingLink: null };
const panelStateStub = {
  expandedCategories: new Set<string>(),
  editingCategoryId: null,
  addCategoryDialogOpen: false,
  newCategoryName: "",
};
const panelActionsStub = {
  setEditingCategoryId: vi.fn(),
  setAddCategoryDialogOpen: vi.fn(),
  setNewCategoryName: vi.fn(),
  handleAddCategory: vi.fn(),
  handleRenameCategory: vi.fn(),
  toggleCategoryExpanded: vi.fn(),
};

const useManualNavStateMock = vi.fn(() => ({
  state: stateStub,
  setState: vi.fn(),
  categoryById: new Map([["quick", stateStub.categories[0]]]),
  categoryLayout: "top" as const,
  columnsPerRow: 5,
  showRecentVisits: true,
  recentVisitsRows: 2,
  recentVisitsCardSize: 120,
  hiddenRecentVisitIds: ["visit-hidden"],
  createCategory: vi.fn(),
  renameCategory: vi.fn(),
  onAddLink: vi.fn(),
  onRemoveLink: vi.fn(),
  onUpdateLink: vi.fn(),
  onUpdateLinkTitle: vi.fn(),
  addRecentVisitToCategory: vi.fn(),
  handleImport: vi.fn(),
  handleDeleteCategoryFromSettings: vi.fn(),
  handleCategoryLayoutChange: vi.fn(),
  handleMaxVisibleRowsChange: vi.fn(),
  handleColumnsPerRowChange: vi.fn(),
  handleShowRecentVisitsChange: vi.fn(),
  handleRecentVisitsRowsChange: vi.fn(),
  handleRecentVisitsCardSizeChange: vi.fn(),
  handleHideRecentVisit: vi.fn(),
}));

const useCategoryPanelStateMock = vi.fn(() => ({
  panelState: panelStateStub,
  panelActions: panelActionsStub,
}));

const useRecentVisitsMock = vi.fn(() => ({
  recentVisits: [
    {
      id: "visit-hidden",
      title: "Hidden",
      url: "https://hidden.example",
      origin: "https://hidden.example",
      lastVisitedAt: Date.now(),
    },
    {
      id: "visit-visible",
      title: "Visible",
      url: "https://visible.example",
      origin: "https://visible.example",
      lastVisitedAt: Date.now(),
    },
  ],
  historyAvailable: true,
}));

const useManualNavPageDialogsStateMock = vi.fn(() => ({
  setEditingLink: vi.fn(),
  dialogsProps: dialogsPropsStub,
}));

const useManualNavWorkspacePropsMock = vi.fn(() => ({
  workspaceProps: workspacePropsStub,
  moveLink: vi.fn(),
}));

const useManualNavSettingsSheetModelMock = vi.fn(() => settingsSheetPropsStub);

vi.mock("@/features/manual-nav/model/useManualNavState", () => ({
  useManualNavState: (...args: unknown[]) => useManualNavStateMock(...args),
}));

vi.mock("@/shared/lib/hooks/useCategoryPanelState", () => ({
  useCategoryPanelState: (...args: unknown[]) => useCategoryPanelStateMock(...args),
}));

vi.mock("@/features/recent-visits/model/useRecentVisits", () => ({
  useRecentVisits: (...args: unknown[]) => useRecentVisitsMock(...args),
}));

vi.mock("@/features/manual-nav/model/useManualNavPageDialogsState", () => ({
  useManualNavPageDialogsState: (...args: unknown[]) => useManualNavPageDialogsStateMock(...args),
}));

vi.mock("@/features/manual-nav/model/useManualNavWorkspaceProps", () => ({
  useManualNavWorkspaceProps: (...args: unknown[]) => useManualNavWorkspacePropsMock(...args),
}));

vi.mock("@/features/settings/model/useManualNavSettingsSheetModel", () => ({
  useManualNavSettingsSheetModel: (...args: unknown[]) => useManualNavSettingsSheetModelMock(...args),
}));

describe("useManualNavPage", () => {
  it("combines page state, workspace props, settings props, and dialogs props", () => {
    const { result } = renderHook(() => useManualNavPage());
    const expectedVisibleCount = normalizeRecentVisitsLimit(
      getRecentVisitsVisibleCount(
        estimateRecentVisitsContentWidth(window.innerWidth),
        2,
        120,
      ),
    );

    expect(useRecentVisitsMock).toHaveBeenCalledWith(expect.objectContaining({
      enabled: true,
      count: expectedVisibleCount + 2,
    }));
    expect(useManualNavWorkspacePropsMock).toHaveBeenCalledWith(expect.objectContaining({
      state: stateStub,
      activeCategoryId: "quick",
      categoryLayout: "top",
      columnsPerRow: 5,
      maxVisibleRows: 4,
      panelState: panelStateStub,
      panelActions: panelActionsStub,
      recentVisits: [expect.objectContaining({ id: "visit-visible" })],
      historyAvailable: true,
      showRecentVisits: true,
      recentVisitsRows: 2,
      recentVisitsCardSize: 120,
      onHideRecentVisit: expect.any(Function),
    }));
    expect(useManualNavSettingsSheetModelMock).toHaveBeenCalled();
    expect(result.current.workspaceProps).toBe(workspacePropsStub);
    expect(result.current.settingsSheetProps).toBe(settingsSheetPropsStub);
    expect(result.current.dialogsProps).toBe(dialogsPropsStub);
  });
});
