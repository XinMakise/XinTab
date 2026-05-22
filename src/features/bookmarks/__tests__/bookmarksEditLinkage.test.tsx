import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Bookmarks from "@/pages/bookmarks/ui/Page";
import { dndLinkId } from "@/shared/lib/dnd/dndUtils";

const storageGetMock = vi.fn();
const storageSetMock = vi.fn(() => Promise.resolve());
const getBookmarksByFoldersMock = vi.fn();
const updateBookmarkMock = vi.fn(() => Promise.resolve());
const moveBookmarkMock = vi.fn(() => Promise.resolve());
const removeBookmarkMock = vi.fn(() => Promise.resolve());

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: (...args: Parameters<typeof storageGetMock>) => storageGetMock(...args),
    set: (...args: Parameters<typeof storageSetMock>) => storageSetMock(...args),
  },
}));

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarksByFolders: (...args: Parameters<typeof getBookmarksByFoldersMock>) =>
    getBookmarksByFoldersMock(...args),
  getBookmarksBarId: vi.fn(() => Promise.resolve("root")),
}));

vi.mock("@/features/bookmarks/lib/chromeBookmarkEditor", () => ({
  createBookmark: vi.fn(),
  createBookmarkFolder: vi.fn(),
  moveBookmark: (...args: Parameters<typeof moveBookmarkMock>) => moveBookmarkMock(...args),
  removeBookmark: (...args: Parameters<typeof removeBookmarkMock>) => removeBookmarkMock(...args),
  removeBookmarkFolder: vi.fn(),
  updateBookmark: (...args: Parameters<typeof updateBookmarkMock>) => updateBookmarkMock(...args),
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/features/bookmarks/ui/BookmarksWorkspace", () => ({
  BookmarksWorkspace: (props: {
    contentModel: {
      content: {
        view: {
          categories: Array<{ id: string; name: string; links: Array<{ id: string; title: string; url: string }> }>;
        };
        actions: {
          onEditLink: (categoryId: string, link: { id: string; title: string; url: string }) => void;
          onRemoveLink: (categoryId: string, linkId: string) => void;
        };
      };
    };
    onDragEnd: (event: unknown) => void;
  }) => {
    const categories = props.contentModel.content.view.categories;
    const editedCategory = categories.find((category) =>
      category.links.some((link) => link.id === "bookmark-1"),
    );
    const editedLink = editedCategory?.links.find((link) => link.id === "bookmark-1");

    return (
      <div>
        <div data-testid="bookmark-summary">
          {categories
            .map((category) => `${category.id}:${category.links.map((link) => link.title).join(",")}`)
            .join("|")}
        </div>
        {editedCategory && editedLink ? (
          <button
            type="button"
            onClick={() =>
              props.contentModel.content.actions.onEditLink(editedCategory.id, {
                id: editedLink.id,
                title: editedLink.title,
                url: editedLink.url,
              })
            }
          >
            打开编辑书签
          </button>
        ) : null}
        {editedLink ? (
          <button
            type="button"
            onClick={() =>
              props.onDragEnd({
                active: {
                  id: dndLinkId("bookmark-1"),
                  data: { current: { type: "nav-link" } },
                },
                over: {
                  id: dndLinkId("bookmark-2"),
                },
              })
            }
          >
            执行排序到末尾
          </button>
        ) : null}
        {editedCategory && editedLink ? (
          <button
            type="button"
            onClick={() => props.contentModel.content.actions.onRemoveLink(editedCategory.id, editedLink.id)}
          >
            删除已更新书签
          </button>
        ) : null}
      </div>
    );
  },
}));

vi.mock("@/features/settings/ui/BookmarksSettingsSheet", () => ({
  BookmarksSettingsSheet: () => null,
}));

describe("bookmarks edit linkage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
    HTMLElement.prototype.scrollIntoView = vi.fn();
    storageGetMock.mockResolvedValue(undefined);
    getBookmarksByFoldersMock.mockResolvedValue([
      {
        id: "folder-1",
        name: "开发",
        links: [
          { id: "bookmark-1", title: "Docs", url: "https://docs.example.com" },
          { id: "bookmark-3", title: "Guide", url: "https://guide.example.com" },
        ],
      },
      {
        id: "folder-2",
        name: "学习",
        links: [{ id: "bookmark-2", title: "TypeScript", url: "https://typescriptlang.org" }],
      },
    ]);
  });

  it("keeps the Bookmarks page consistent across edit, reorder, and delete", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Bookmarks />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-summary")).toHaveTextContent(
        "folder-1:Docs,Guide|folder-2:TypeScript",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "打开编辑书签" }));

    const titleInput = await screen.findByLabelText("名称");
    fireEvent.change(titleInput, { target: { value: "Docs Updated" } });

    const categorySelect = screen.getByRole("combobox");
    fireEvent.keyDown(categorySelect, { key: "ArrowDown" });
    fireEvent.click(await screen.findByText("学习"));

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-summary")).toHaveTextContent(
        "folder-1:Guide|folder-2:Docs Updated,TypeScript",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "执行排序到末尾" }));

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-summary")).toHaveTextContent(
        "folder-1:Guide|folder-2:TypeScript,Docs Updated",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "删除已更新书签" }));

    await waitFor(() => {
      expect(screen.getByTestId("bookmark-summary")).toHaveTextContent(
        "folder-1:Guide|folder-2:TypeScript",
      );
    });

    expect(updateBookmarkMock).toHaveBeenCalledWith("bookmark-1", { title: "Docs Updated" });
    expect(moveBookmarkMock).toHaveBeenCalledWith("bookmark-1", { parentId: "folder-2" });
    expect(moveBookmarkMock).toHaveBeenCalledWith("bookmark-1", { parentId: "folder-2", index: 1 });
    expect(removeBookmarkMock).toHaveBeenCalledWith("bookmark-1");
  });
});

