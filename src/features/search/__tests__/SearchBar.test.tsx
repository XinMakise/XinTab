import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "@/features/search/ui/SearchBar";
import { SEARCH_SETTINGS_KEY } from "@/features/search";
import type { SearchSettings, SearchSuggestionItem } from "@/shared/types/search";

const storageGetMock = vi.fn();
const storageSetMock = vi.fn();
const openMock = vi.fn();
const useSearchSuggestionsMock = vi.fn();

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: (...args: unknown[]) => storageGetMock(...args),
    set: (...args: unknown[]) => storageSetMock(...args),
    remove: vi.fn(),
  },
}));

vi.mock("@/features/search/ui/AddSearchEngineDialog", () => ({
  AddSearchEngineDialog: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}));

vi.mock("@/features/search/model/useSearchSuggestions", () => ({
  useSearchSuggestions: (query: string) => useSearchSuggestionsMock(query),
}));

vi.mock("@/shared/ui/primitives/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <div role="menuitem" onClick={onClick}>
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <div role="separator" />,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    storageGetMock.mockResolvedValue(null);
    storageSetMock.mockResolvedValue(undefined);
    openMock.mockReset();
    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: [],
      bookmarkSuggestions: [],
      suggestions: query.trim() ? [] : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));
    Object.defineProperty(window, "open", {
      configurable: true,
      writable: true,
      value: openMock,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads saved settings and submits a search on Enter", async () => {
    storageGetMock.mockResolvedValue({
      activeEngineId: "google",
      customEngines: [],
      showSearchBar: true,
      showSearchSuggestions: true,
      suggestionsOpacity: 92,
      suggestionsMaterial: "transparent",
    } satisfies SearchSettings);

    render(<SearchBar />);

    expect(storageGetMock).toHaveBeenCalledWith(SEARCH_SETTINGS_KEY);

    const input = await screen.findByPlaceholderText("在 Google 中搜索...");
    fireEvent.change(input, { target: { value: "react hooks" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(openMock).toHaveBeenCalledWith(
        "https://www.google.com/search?q=react%20hooks",
        "_blank",
      );
    });
  });

  it("cycles search engines with Tab and persists the new selection", async () => {
    const onSettingsChange = vi.fn();

    render(<SearchBar onSettingsChange={onSettingsChange} />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.keyDown(input, { key: "Tab" });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("在 百度 中搜索...")).toBeInTheDocument();
    });
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ activeEngineId: "baidu" }),
    );

    await waitFor(() => {
      expect(storageSetMock).toHaveBeenCalledWith(
        SEARCH_SETTINGS_KEY,
        expect.objectContaining({ activeEngineId: "baidu" }),
      );
    });
  });

  it("falls back to Bing when the active custom engine is removed", async () => {
    const onSettingsChange = vi.fn();

    storageGetMock.mockResolvedValue({
      activeEngineId: "github",
      customEngines: [
        {
          id: "github",
          name: "GitHub",
          urlTemplate: "https://github.com/search?q={query}",
          icon: "https://github.com/favicon.ico",
        },
      ],
      showSearchBar: true,
      showSearchSuggestions: true,
      suggestionsOpacity: 92,
      suggestionsMaterial: "transparent",
    } satisfies SearchSettings);

    render(<SearchBar onSettingsChange={onSettingsChange} />);

    await screen.findByRole("menu");

    const gitHubItem = (await screen.findAllByRole("menuitem")).find((item) =>
      within(item).queryByText("GitHub"),
    );
    expect(gitHubItem).toBeTruthy();

    fireEvent.click(within(gitHubItem!).getByRole("button"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("在 Bing 中搜索...")).toBeInTheDocument();
    });
    expect(onSettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        activeEngineId: "bing",
        customEngines: [],
      }),
    );
  });

  it("opens a clicked suggestion directly", async () => {
    const historySuggestion: SearchSuggestionItem = {
      id: "history:https://github.com/openai",
      source: "history",
      title: "GitHub OpenAI",
      url: "https://github.com/openai",
      subtitle: "github.com/openai",
      lastVisitedAt: Date.now(),
    };
    const bookmarkSuggestion: SearchSuggestionItem = {
      id: "bookmark:1",
      source: "bookmark",
      title: "Docs Portal",
      url: "https://docs.example.com",
      subtitle: "docs.example.com",
    };

    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: query.trim() ? [historySuggestion] : [],
      bookmarkSuggestions: query.trim() ? [bookmarkSuggestion] : [],
      suggestions: query.trim() ? [historySuggestion, bookmarkSuggestion] : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));

    render(<SearchBar />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "git" } });

    const option = await screen.findByRole("option", { name: /GitHub OpenAI/ });
    fireEvent.click(option);

    expect(openMock).toHaveBeenCalledWith("https://github.com/openai", "_blank");
  });

  it("opens the highlighted suggestion on Enter after keyboard navigation", async () => {
    const historySuggestion: SearchSuggestionItem = {
      id: "history:https://github.com/openai",
      source: "history",
      title: "GitHub OpenAI",
      url: "https://github.com/openai",
      subtitle: "github.com/openai",
      lastVisitedAt: Date.now(),
    };
    const bookmarkSuggestion: SearchSuggestionItem = {
      id: "bookmark:1",
      source: "bookmark",
      title: "Docs Portal",
      url: "https://docs.example.com",
      subtitle: "docs.example.com",
    };

    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: query.trim() ? [historySuggestion] : [],
      bookmarkSuggestions: query.trim() ? [bookmarkSuggestion] : [],
      suggestions: query.trim() ? [historySuggestion, bookmarkSuggestion] : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));

    render(<SearchBar />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "git" } });
    await screen.findByRole("listbox", { name: "搜索建议" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openMock).toHaveBeenCalledWith("https://github.com/openai", "_blank");
  });

  it("submits a normal search on Enter when suggestions are visible but not selected", async () => {
    const historySuggestion: SearchSuggestionItem = {
      id: "history:https://github.com/openai",
      source: "history",
      title: "GitHub OpenAI",
      url: "https://github.com/openai",
      subtitle: "github.com/openai",
      lastVisitedAt: Date.now(),
    };
    const bookmarkSuggestion: SearchSuggestionItem = {
      id: "bookmark:1",
      source: "bookmark",
      title: "Docs Portal",
      url: "https://docs.example.com",
      subtitle: "docs.example.com",
    };

    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: query.trim() ? [historySuggestion] : [],
      bookmarkSuggestions: query.trim() ? [bookmarkSuggestion] : [],
      suggestions: query.trim() ? [historySuggestion, bookmarkSuggestion] : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));

    render(<SearchBar />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "git" } });
    await screen.findByRole("listbox", { name: "搜索建议" });

    fireEvent.keyDown(input, { key: "Enter" });

    expect(openMock).toHaveBeenCalledWith("https://www.bing.com/search?q=git", "_blank");
  });

  it("clears the active suggestion after the query changes", async () => {
    const historySuggestion: SearchSuggestionItem = {
      id: "history:https://github.com/openai",
      source: "history",
      title: "GitHub OpenAI",
      url: "https://github.com/openai",
      subtitle: "github.com/openai",
      lastVisitedAt: Date.now(),
    };
    const bookmarkSuggestion: SearchSuggestionItem = {
      id: "bookmark:1",
      source: "bookmark",
      title: "Docs Portal",
      url: "https://docs.example.com",
      subtitle: "docs.example.com",
    };

    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: query.trim() ? [historySuggestion] : [],
      bookmarkSuggestions: query.trim() ? [bookmarkSuggestion] : [],
      suggestions: query.trim() ? [historySuggestion, bookmarkSuggestion] : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));

    render(<SearchBar />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "git" } });
    await screen.findByRole("listbox", { name: "搜索建议" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.change(input, { target: { value: "git hooks" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openMock).toHaveBeenCalledWith(
      "https://www.bing.com/search?q=git%20hooks",
      "_blank",
    );
  });

  it("hides suggestions when the feature is disabled in settings", async () => {
    storageGetMock.mockResolvedValue({
      activeEngineId: "bing",
      customEngines: [],
      showSearchBar: true,
      showSearchSuggestions: false,
      suggestionsOpacity: 92,
      suggestionsMaterial: "transparent",
    } satisfies SearchSettings);

    useSearchSuggestionsMock.mockImplementation((query: string) => ({
      historySuggestions: query.trim()
        ? [{
            id: "history:https://github.com/openai",
            source: "history",
            title: "GitHub OpenAI",
            url: "https://github.com/openai",
            subtitle: "github.com/openai",
            lastVisitedAt: Date.now(),
          }]
        : [],
      bookmarkSuggestions: [],
      suggestions: query.trim()
        ? [{
            id: "history:https://github.com/openai",
            source: "history",
            title: "GitHub OpenAI",
            url: "https://github.com/openai",
            subtitle: "github.com/openai",
            lastVisitedAt: Date.now(),
          }]
        : [],
      loading: false,
      historyAvailable: true,
      bookmarkAvailable: true,
    }));

    render(<SearchBar />);

    const input = await screen.findByPlaceholderText("在 Bing 中搜索...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "git" } });

    expect(screen.queryByRole("listbox", { name: "搜索建议" })).not.toBeInTheDocument();
  });
});


