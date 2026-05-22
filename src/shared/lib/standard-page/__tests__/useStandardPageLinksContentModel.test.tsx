import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStandardPageLinksContentModel } from "@/shared/lib/standard-page/useStandardPageLinksContentModel";
import type { Category } from "@/shared/types/category";

const categories: Category[] = [
  {
    id: "cat-a",
    name: "常用",
    links: [{ id: "link-1", title: "GitHub", url: "https://github.com" }],
  },
];

describe("useStandardPageLinksContentModel", () => {
  it("builds shared standard-page content view and actions", () => {
    const panelActions = {
      toggleCategoryExpanded: vi.fn(),
      setEditingCategoryId: vi.fn(),
      handleRenameCategory: vi.fn(),
    };
    const onRemoveLink = vi.fn();
    const onEditLink = vi.fn();
    const onAddLink = vi.fn();

    const { result } = renderHook(() =>
      useStandardPageLinksContentModel({
        mode: "all",
        categories,
        activeCategory: categories[0],
        columnsPerRow: 2,
        maxVisibleRows: 3,
        panelState: {
          expandedCategories: new Set(["cat-a"]),
          editingCategoryId: "cat-a",
        },
        panelActions,
        emptyHint: "暂无内容",
        enableCustomIcon: false,
        highlightWhenOver: true,
        onRemoveLink,
        onEditLink,
        onAddLink,
      }),
    );

    expect(result.current.view).toMatchObject({
      mode: "all",
      categories,
      activeCategory: categories[0],
      columnsPerRow: 2,
      maxVisibleRows: 3,
      emptyHint: "暂无内容",
      enableCustomIcon: false,
      highlightWhenOver: true,
      editingCategoryId: "cat-a",
    });
    expect(result.current.view.expandedCategories).toEqual(new Set(["cat-a"]));

    result.current.actions.onToggleExpanded("cat-a");
    result.current.actions.onStartEditCategory("cat-a");
    result.current.actions.onRenameCategory("cat-a", "重命名");
    result.current.actions.onRemoveLink("cat-a", "link-1");
    result.current.actions.onEditLink("cat-a", categories[0].links[0]);
    result.current.actions.onAddLink("cat-a", categories[0].links[0]);

    expect(panelActions.toggleCategoryExpanded).toHaveBeenCalledWith("cat-a");
    expect(panelActions.setEditingCategoryId).toHaveBeenCalledWith("cat-a");
    expect(panelActions.handleRenameCategory).toHaveBeenCalledWith("cat-a", "重命名");
    expect(onRemoveLink).toHaveBeenCalledWith("cat-a", "link-1");
    expect(onEditLink).toHaveBeenCalledWith("cat-a", categories[0].links[0]);
    expect(onAddLink).toHaveBeenCalledWith("cat-a", categories[0].links[0]);
  });
});

