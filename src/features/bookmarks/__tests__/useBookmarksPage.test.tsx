import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BookmarksSettingsSheetModel } from "@/features/settings";
import { useBookmarksPage } from "@/features/bookmarks";

const categories = [{ id: "dev", name: "开发", links: [] }];
const workspacePropsStub = { contentModel: { status: {}, content: {} } };
const settingsSheetPropsStub = {
  model: {
    kind: "bookmarks",
    categoryManagement: {
      categories,
      onCreateCategory: vi.fn(),
      onDeleteCategory: vi.fn(),
    },
    layout: {
      bookmarksLayout: "top" as const,
      onBookmarksLayoutChange: vi.fn(),
      maxVisibleRows: 3,
      onMaxVisibleRowsChange: vi.fn(),
      columnsPerRow: 5,
      onColumnsPerRowChange: vi.fn(),
    },
    appearance: {},
  } satisfies BookmarksSettingsSheetModel,
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

const useBookmarksPageStateMock = vi.fn(() => ({
  setCategories: vi.fn(),
  loading: false,
  error: null,
  activeId: "dev",
  setActiveId: vi.fn(),
  uiState: { maxVisibleRows: 3 },
  orderedCategories: categories,
  categoryById: new Map([["dev", categories[0]]]),
  activeCategory: categories[0],
  layout: "top" as const,
  columnsPerRow: 5,
  handleAddBookmark: vi.fn(),
  handleRemoveBookmark: vi.fn(),
  handleUpdateBookmark: vi.fn(),
  handleCreateFolder: vi.fn(),
  handleRenameFolder: vi.fn(),
  handleDeleteFolder: vi.fn(),
  handleCategoryOrderChange: vi.fn(),
  handleLayoutChange: vi.fn(),
  handleMaxVisibleRowsChange: vi.fn(),
  handleColumnsPerRowChange: vi.fn(),
}));

const useCategoryPanelStateMock = vi.fn(() => ({
  panelState: panelStateStub,
  panelActions: panelActionsStub,
}));

const useBookmarksPageDialogsStateMock = vi.fn(() => ({
  setEditingLink: vi.fn(),
  onDeleteCategoryIntent: vi.fn(),
  dialogsProps: dialogsPropsStub,
}));

const useBookmarksWorkspacePropsMock = vi.fn(() => ({
  workspaceProps: workspacePropsStub,
}));

const useBookmarksSettingsSheetModelMock = vi.fn(() => settingsSheetPropsStub);

vi.mock("@/features/bookmarks/model/useBookmarksPageState", () => ({
  useBookmarksPageState: (...args: unknown[]) => useBookmarksPageStateMock(...args),
}));

vi.mock("@/shared/lib/hooks/useCategoryPanelState", () => ({
  useCategoryPanelState: (...args: unknown[]) => useCategoryPanelStateMock(...args),
}));

vi.mock("@/features/bookmarks/model/useBookmarksPageDialogsState", () => ({
  useBookmarksPageDialogsState: (...args: unknown[]) => useBookmarksPageDialogsStateMock(...args),
}));

vi.mock("@/features/bookmarks/model/useBookmarksWorkspaceProps", () => ({
  useBookmarksWorkspaceProps: (...args: unknown[]) => useBookmarksWorkspacePropsMock(...args),
}));

vi.mock("@/features/settings/model/useBookmarksSettingsSheetModel", () => ({
  useBookmarksSettingsSheetModel: (...args: unknown[]) => useBookmarksSettingsSheetModelMock(...args),
}));

describe("useBookmarksPage", () => {
  it("combines page state, workspace props, settings props, and dialogs props", () => {
    const { result } = renderHook(() => useBookmarksPage());

    expect(useBookmarksWorkspacePropsMock).toHaveBeenCalledWith(expect.objectContaining({
      status: { error: null, loading: false },
      categories,
      activeCategoryId: "dev",
      layout: "top",
      columnsPerRow: 5,
      maxVisibleRows: 3,
      panelState: panelStateStub,
      panelActions: panelActionsStub,
    }));
    expect(useBookmarksSettingsSheetModelMock).toHaveBeenCalled();
    expect(result.current.workspaceProps).toBe(workspacePropsStub);
    expect(result.current.settingsSheetProps).toBe(settingsSheetPropsStub);
    expect(result.current.dialogsProps).toBe(dialogsPropsStub);
  });
});
