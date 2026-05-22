import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingSettingsTrigger } from "@/features/settings/ui/FloatingSettingsTrigger";
import { SettingsSheet } from "@/features/settings/ui/SettingsSheet";
import type {
  BookmarksSettingsSheetModel,
  ManualSettingsSheetModel,
} from "@/features/settings";
import { SEARCH_SETTINGS_KEY, defaultSearchSettings } from "@/features/search";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui/primitives/accordion";

const { storageGetMock, storageSetMock } = vi.hoisted(() => ({
  storageGetMock: vi.fn(),
  storageSetMock: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("@/features/appearance/ui/AppearancePanel", () => ({
  AppearancePanel: () => (
    <AccordionItem value="appearance">
      <AccordionTrigger>外观主题</AccordionTrigger>
      <AccordionContent>appearance</AccordionContent>
    </AccordionItem>
  ),
}));

vi.mock("@/features/settings/ui/LayoutSettingsPanel", () => ({
  LayoutSettingsPanel: ({
    layout,
    onLayoutChange,
    onColumnsPerRowChange,
  }: {
    layout?: "top" | "left" | "all";
    onLayoutChange?: (layout: "top" | "left" | "all") => void;
    onColumnsPerRowChange?: (columns: number) => void;
  }) => (
    <AccordionItem value="layout">
      <AccordionTrigger>布局与显示</AccordionTrigger>
      <AccordionContent>
        <div>{`layout-${layout ?? "none"}`}</div>
        <button type="button" onClick={() => onLayoutChange?.("all")}>
          切换为全部分类纵向
        </button>
        <button type="button" onClick={() => onColumnsPerRowChange?.(4)}>
          每行卡片数改为 4
        </button>
      </AccordionContent>
    </AccordionItem>
  ),
}));

vi.mock("@/features/manual-nav/ui/CategoryManagePanel", () => ({
  CategoryManagePanel: () => (
    <AccordionItem value="categories">
      <AccordionTrigger>内容管理</AccordionTrigger>
      <AccordionContent>categories</AccordionContent>
    </AccordionItem>
  ),
}));

vi.mock("@/features/backup/ui/DataManagePanel", () => ({
  DataManagePanel: () => null,
}));

vi.mock("@/features/quick-edit/ui/QuickEditDialog", () => ({
  QuickEditDialog: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div>
        <div>快速编辑对话框</div>
        <button type="button" onClick={() => onOpenChange(false)}>
          关闭快速编辑
        </button>
      </div>
    ) : null,
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: storageGetMock,
    set: storageSetMock,
  },
}));

const categories = [{ id: "cat-1", name: "常用", links: [] }];

function createManualModel(
  overrides: Partial<ManualSettingsSheetModel> = {},
): ManualSettingsSheetModel {
  const manualOverrides = overrides as Partial<ManualSettingsSheetModel>;
  const base: ManualSettingsSheetModel = {
    kind: "manual",
    categoryManagement: {
      categories,
      onCreateCategory: vi.fn(),
      onDeleteCategory: vi.fn(),
      onAddLink: vi.fn(),
      onRemoveLink: vi.fn(),
      onUpdateLinkTitle: vi.fn(),
      onMoveLink: vi.fn(),
    },
    layout: {
      categoryLayout: "top",
      onCategoryLayoutChange: vi.fn(),
      maxVisibleRows: 3,
      onMaxVisibleRowsChange: vi.fn(),
      columnsPerRow: 5,
      onColumnsPerRowChange: vi.fn(),
    },
    recentVisits: {
      showRecentVisits: true,
      onShowRecentVisitsChange: vi.fn(),
      recentVisitsRows: 2,
      onRecentVisitsRowsChange: vi.fn(),
      recentVisitsCardSize: 100,
      onRecentVisitsCardSizeChange: vi.fn(),
    },
    appearance: {},
    dataManagement: {
      state: { categories },
      onImport: vi.fn(),
    },
  };

  return {
    ...base,
    ...manualOverrides,
    categoryManagement: {
      ...base.categoryManagement,
      ...manualOverrides.categoryManagement,
    },
    layout: {
      ...base.layout,
      ...manualOverrides.layout,
    },
    recentVisits: {
      ...base.recentVisits,
      ...manualOverrides.recentVisits,
    },
    appearance: {},
    dataManagement: {
      ...base.dataManagement,
      ...manualOverrides.dataManagement,
    },
  };
}

function createBookmarksModel(
  overrides: Partial<BookmarksSettingsSheetModel> = {},
): BookmarksSettingsSheetModel {
  const bookmarksOverrides = overrides as Partial<BookmarksSettingsSheetModel>;
  const base: BookmarksSettingsSheetModel = {
    kind: "bookmarks",
    categoryManagement: {
      categories,
      onCreateCategory: vi.fn(),
      onDeleteCategory: vi.fn(),
    },
    layout: {
      bookmarksLayout: "top",
      onBookmarksLayoutChange: vi.fn(),
      maxVisibleRows: 3,
      onMaxVisibleRowsChange: vi.fn(),
      columnsPerRow: 5,
      onColumnsPerRowChange: vi.fn(),
    },
    appearance: {},
  };

  return {
    ...base,
    ...bookmarksOverrides,
    categoryManagement: {
      ...base.categoryManagement,
      ...bookmarksOverrides.categoryManagement,
    },
    layout: {
      ...base.layout,
      ...bookmarksOverrides.layout,
    },
    appearance: {},
  };
}

describe("SettingsSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageGetMock.mockResolvedValue(null);
    storageSetMock.mockResolvedValue(undefined);
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("opens the sheet and forwards homepage recent-visits toggle through SearchSettingsPanel", async () => {
    const onShowRecentVisitsChange = vi.fn();

    render(
      <SettingsSheet
        model={createManualModel({
          recentVisits: {
            showRecentVisits: false,
            onShowRecentVisitsChange,
          },
        })}
        trigger={<button type="button">打开设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));

    await waitFor(() => {
      expect(screen.getByText("设置")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "搜索与最近访问" }));

    await waitFor(() => {
      expect(screen.getByText("显示最近访问")).toBeInTheDocument();
    });

    const switches = screen.getAllByRole("switch");
    fireEvent.click(switches[2]);

    expect(onShowRecentVisitsChange).toHaveBeenCalledWith(true);
  });

  it("opens the sheet and forwards bookmarks layout changes through LayoutSettingsPanel", async () => {
    const onBookmarksLayoutChange = vi.fn();

    render(
      <SettingsSheet
        model={createBookmarksModel({
          layout: {
            bookmarksLayout: "top",
            onBookmarksLayoutChange,
          },
        })}
        trigger={<button type="button">打开收藏设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开收藏设置" }));

    await waitFor(() => {
      expect(screen.getByText("设置")).toBeInTheDocument();
    });

    fireEvent.click(await screen.findByRole("button", { name: "切换为全部分类纵向" }));

    expect(onBookmarksLayoutChange).toHaveBeenCalledWith("all");
  });

  it("persists search-bar visibility changes through SearchSettingsPanel", async () => {
    render(
      <SettingsSheet
        model={createManualModel()}
        trigger={<button type="button">打开设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));
    fireEvent.click(await screen.findByRole("button", { name: "搜索与最近访问" }));

    expect(screen.queryByText("数量")).not.toBeInTheDocument();

    const switches = await screen.findAllByRole("switch");
    fireEvent.click(switches[0]);

    await waitFor(() => {
      expect(storageSetMock).toHaveBeenCalledWith(SEARCH_SETTINGS_KEY, {
        ...defaultSearchSettings(),
        showSearchBar: false,
      });
    });
  });

  it("persists search-suggestions visibility changes through SearchSettingsPanel", async () => {
    render(
      <SettingsSheet
        model={createManualModel()}
        trigger={<button type="button">打开设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));
    fireEvent.click(await screen.findByRole("button", { name: "搜索与最近访问" }));

    const switches = await screen.findAllByRole("switch");
    fireEvent.click(switches[1]);

    await waitFor(() => {
      expect(storageSetMock).toHaveBeenCalledWith(SEARCH_SETTINGS_KEY, {
        ...defaultSearchSettings(),
        showSearchSuggestions: false,
      });
    });
  });

  it("opens and closes QuickEditDialog from the settings sheet", async () => {
    render(
      <SettingsSheet
        model={createManualModel()}
        trigger={<button type="button">打开设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));
    fireEvent.click(await screen.findByRole("button", { name: "快速编辑" }));

    expect(await screen.findByText("快速编辑对话框")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "关闭快速编辑" }));

    await waitFor(() => {
      expect(screen.queryByText("快速编辑对话框")).not.toBeInTheDocument();
    });
  });

  it("forwards cards-per-row changes through LayoutSettingsPanel", async () => {
    const onColumnsPerRowChange = vi.fn();

    render(
      <SettingsSheet
        model={createManualModel({
          layout: {
            columnsPerRow: 5,
            onColumnsPerRowChange,
          },
        })}
        trigger={<button type="button">打开设置</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));
    fireEvent.click(await screen.findByRole("button", { name: "每行卡片数改为 4" }));

    expect(onColumnsPerRowChange).toHaveBeenCalledWith(4);
  });

  it("opens the sheet when using FloatingSettingsTrigger", async () => {
    render(
      <SettingsSheet
        model={createManualModel()}
        trigger={<FloatingSettingsTrigger />}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "设置" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
