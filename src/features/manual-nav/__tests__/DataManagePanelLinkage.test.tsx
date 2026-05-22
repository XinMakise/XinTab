import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { DataManagePanel } from "@/features/manual-nav/ui/DataManagePanel";
import { Accordion } from "@/shared/ui/primitives/accordion";
import { useManualNavState } from "@/features/manual-nav";
import { storage } from "@/shared/browser/storage";
import type { ManualNavState } from "@/shared/types/manual-nav";

vi.mock("@/shared/lib/hooks/useDebounce", () => ({
  useDebouncedCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

const mockedStorage = vi.mocked(storage);

const baseState: ManualNavState = {
  categories: [
    {
      id: "quick",
      name: "常用",
      links: [{ id: "github", title: "GitHub", url: "https://github.com" }],
    },
  ],
  ui: {
    categoryLayout: "top",
    columnsPerRow: 5,
    maxVisibleRows: 3,
    showRecentVisits: true,
    recentVisitsCount: 4,
    recentVisitsCardSize: 100,
  },
};

function createMockImportFile(contents: string, name = "dump.json") {
  const file = new File([contents], name, { type: "application/json" });
  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(contents),
    configurable: true,
  });
  return file;
}

function ManualNavImportHarness() {
  const [activeCategoryId, setActiveCategoryId] = useState("quick");
  const { state, handleImport, loading } = useManualNavState({ setActiveCategoryId });

  if (loading) return <div>loading</div>;

  return (
    <>
      <div data-testid="category-names">{state.categories.map((category) => category.name).join(",")}</div>
      <div data-testid="layout-mode">{state.ui?.categoryLayout ?? "top"}</div>
      <div data-testid="active-category">{activeCategoryId}</div>
      <Accordion type="single" collapsible value="data">
        <DataManagePanel state={state} onImport={handleImport} />
      </Accordion>
    </>
  );
}

describe("DataManagePanel linkage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    mockedStorage.get.mockImplementation(async (key: string) => {
      if (key === "manual_nav_v1") return baseState;
      return null;
    });
  });

  it("persists overwrite imports back into manual_nav_v1", async () => {
    const importData = {
      version: 1 as const,
      exportedAt: "2026-03-30T00:00:00.000Z",
      categories: [
        {
          id: "imported",
          name: "导入分类",
          links: [{ id: "openai", title: "OpenAI", url: "https://openai.com" }],
        },
      ],
      ui: {
        categoryLayout: "all" as const,
        columnsPerRow: 3,
        maxVisibleRows: 2,
      },
    };

    const { container } = render(<ManualNavImportHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("category-names")).toHaveTextContent("常用");
    });

    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [createMockImportFile(JSON.stringify(importData))] },
    });

    const dialog = await screen.findByRole("dialog");
    const selectTrigger = within(dialog).getByRole("combobox");
    fireEvent.keyDown(selectTrigger, { key: "ArrowDown" });
    fireEvent.click(await screen.findByText("覆盖（替换现有数据）"));
    fireEvent.click(within(dialog).getByRole("button", { name: "确认导入" }));

    await waitFor(() => {
      expect(screen.getByTestId("category-names")).toHaveTextContent("导入分类");
      expect(screen.getByTestId("layout-mode")).toHaveTextContent("all");
    });

    expect(mockedStorage.set).toHaveBeenCalledWith(
      "manual_nav_v1",
      expect.objectContaining({
        categories: importData.categories,
        ui: expect.objectContaining({
          categoryLayout: "all",
          columnsPerRow: 3,
          maxVisibleRows: 2,
        }),
      }),
    );
  });

  it("persists merge imports back into manual_nav_v1", async () => {
    const importData = {
      version: 1 as const,
      exportedAt: "2026-03-30T00:00:00.000Z",
      categories: [
        {
          id: "dev",
          name: "开发",
          links: [{ id: "vite", title: "Vite", url: "https://vite.dev" }],
        },
      ],
    };

    const { container } = render(<ManualNavImportHarness />);

    await waitFor(() => {
      expect(screen.getByTestId("category-names")).toHaveTextContent("常用");
    });

    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, {
      target: { files: [createMockImportFile(JSON.stringify(importData))] },
    });

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "确认导入" }));

    await waitFor(() => {
      expect(screen.getByTestId("category-names")).toHaveTextContent("常用,开发");
      expect(screen.getByTestId("layout-mode")).toHaveTextContent("top");
    });

    expect(mockedStorage.set).toHaveBeenCalledWith(
      "manual_nav_v1",
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({ id: "quick", name: "常用" }),
          expect.objectContaining({ id: "dev", name: "开发" }),
        ]),
      }),
    );
  });
});


