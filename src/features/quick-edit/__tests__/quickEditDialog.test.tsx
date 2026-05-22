import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { QuickEditDialog } from "@/features/quick-edit/ui/QuickEditDialog";
import type { Category } from "@/shared/types/category";

const baseCategories: Category[] = [
  {
    id: "cat-1",
    name: "常用",
    links: [
      {
        id: "link-1",
        title: "Example",
        url: "https://example.com",
      },
    ],
  },
];

const quickEditDndStub = {
  sensors: [],
  collisionDetection: () => [],
  onDragStart: () => {},
  onDragOver: () => {},
  onDragEnd: () => {},
  onDragCancel: () => {},
  activeDragItem: null,
  bookmarkDropTargetId: null,
};

const createBookmarkActionsStub = () => ({
  editingBookmark: null,
  editingBookmarkCategoryId: "",
  openEditBookmark: vi.fn(),
  handleSaveBookmark: vi.fn(),
  handleRemoveBookmark: vi.fn(),
  handleQuickAddBookmark: vi.fn(),
  clearEditingBookmark: vi.fn(),
});

let bookmarkActionsStub = createBookmarkActionsStub();
const bookmarkOverviewMock = vi.fn();

vi.mock("@/features/quick-edit/model/useQuickEditDnd", () => ({
  useQuickEditDnd: () => quickEditDndStub,
}));

vi.mock("@/features/quick-edit/model/useQuickEditBookmarkActions", () => ({
  useQuickEditBookmarkActions: () => bookmarkActionsStub,
}));

vi.mock("@/features/bookmarks/model/useBookmarkOverview", () => ({
  useBookmarkOverview: () => bookmarkOverviewMock(),
}));

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  categories: baseCategories,
  onAddLink: vi.fn(),
  onRemoveLink: vi.fn(),
  onUpdateLinkTitle: vi.fn(),
  onMoveLink: vi.fn(),
  onCreateCategory: vi.fn(),
  onDeleteCategory: vi.fn(),
};

const getProps = (overrides = {}) => ({
  ...defaultProps,
  ...overrides,
});

const baseOverviewReturn = () => ({
  categories: [
    {
      id: "bookmark-folder",
      name: "开发",
      links: [
        {
          id: "bookmark-1",
          title: "Docs",
          url: "https://docs.example.com",
        },
      ],
    },
  ],
  loading: false,
  refresh: vi.fn(),
  chromeAvailable: true,
});

describe("QuickEditDialog", () => {
  beforeEach(() => {
    bookmarkActionsStub = createBookmarkActionsStub();
    bookmarkOverviewMock.mockReturnValue(baseOverviewReturn());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the navigation and Chrome sections when open", () => {
    render(<QuickEditDialog {...getProps({ open: true })} />);

    expect(screen.getByText("我的导航")).toBeInTheDocument();
    expect(screen.getByText("Chrome 书签")).toBeInTheDocument();
  });

  it("clears manual and bookmark searches after closing and reopening", () => {
    const { rerender } = render(<QuickEditDialog {...getProps({ open: true })} />);

    const manualSearch = screen.getByPlaceholderText("搜索我的导航...");
    fireEvent.change(manualSearch, { target: { value: "foo" } });
    expect(manualSearch).toHaveValue("foo");

    const bookmarkSearch = screen.getByPlaceholderText("搜索书签...");
    fireEvent.change(bookmarkSearch, { target: { value: "bar" } });
    expect(bookmarkSearch).toHaveValue("bar");

    rerender(<QuickEditDialog {...getProps({ open: false })} />);
    rerender(<QuickEditDialog {...getProps({ open: true })} />);

    expect(screen.getByPlaceholderText("搜索我的导航...")).toHaveValue("");
    expect(screen.getByPlaceholderText("搜索书签...")).toHaveValue("");
  });

  it("shows Chrome unavailable message when bookmark overview reports unavailable", () => {
    bookmarkOverviewMock.mockReturnValue({
      ...baseOverviewReturn(),
      chromeAvailable: false,
    });

    render(<QuickEditDialog {...getProps({ open: true })} />);

    expect(screen.getByText("Chrome 书签不可用")).toBeInTheDocument();
  });

  it("forwards bookmark quick-add actions from the Chrome pane", async () => {
    render(<QuickEditDialog {...getProps({ open: true })} />);

    fireEvent.click(screen.getByText("开发"));
    fireEvent.click(await screen.findByRole("button", { name: "添加到导航" }));

    expect(bookmarkActionsStub.handleQuickAddBookmark).toHaveBeenCalledWith({
      id: "bookmark-1",
      title: "Docs",
      url: "https://docs.example.com",
    });
  });
});

