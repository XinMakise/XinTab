import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useQuickEditBookmarkEditorState } from "@/features/quick-edit";

const bookmark = {
  id: "bookmark-1",
  title: "Docs",
  url: "https://docs.example.com",
};

describe("useQuickEditBookmarkEditorState", () => {
  it("opens and clears the editing bookmark state", () => {
    const { result } = renderHook(() => useQuickEditBookmarkEditorState(true));

    act(() => {
      result.current.openEditBookmark(bookmark, "folder-1");
    });

    expect(result.current.editingBookmark).toEqual(bookmark);
    expect(result.current.editingBookmarkCategoryId).toBe("folder-1");

    act(() => {
      result.current.clearEditingBookmark();
    });

    expect(result.current.editingBookmark).toBeNull();
    expect(result.current.editingBookmarkCategoryId).toBe("");
  });

  it("resets state when the dialog closes", () => {
    const { result, rerender } = renderHook(
      ({ open }) => useQuickEditBookmarkEditorState(open),
      { initialProps: { open: true } },
    );

    act(() => {
      result.current.openEditBookmark(bookmark, "folder-1");
    });

    rerender({ open: false });

    expect(result.current.editingBookmark).toBeNull();
    expect(result.current.editingBookmarkCategoryId).toBe("");
  });
});
