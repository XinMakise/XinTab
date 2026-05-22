import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { DataManagePanel } from "@/features/backup/ui/DataManagePanel";
import { Accordion } from "@/shared/ui/primitives/accordion";
import type { ManualNavState } from "@/shared/types/manual-nav";

const toastMock = vi.fn();

const exportDataMock = vi.fn();
const downloadExportDataMock = vi.fn();
const parseImportFileMock = vi.fn();
const executeImportMock = vi.fn();

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: (...args: Parameters<typeof toastMock>) => toastMock(...args),
}));

vi.mock("@/features/backup/lib/exportImport", () => ({
  exportData: (...args: Parameters<typeof exportDataMock>) => exportDataMock(...args),
  downloadExportData: (...args: Parameters<typeof downloadExportDataMock>) => downloadExportDataMock(...args),
  parseImportFile: (...args: Parameters<typeof parseImportFileMock>) => parseImportFileMock(...args),
  executeImport: (...args: Parameters<typeof executeImportMock>) => executeImportMock(...args),
}));

const baseState: ManualNavState = {
  categories: [
    { id: "cat-1", name: "常用", links: [{ id: "link-1", title: "Example", url: "https://example.com" }] },
  ],
  ui: {
    categoryLayout: "top",
    showRecentVisits: true,
    recentVisitsCount: 4,
    recentVisitsCardSize: 100,
    maxVisibleRows: 3,
    columnsPerRow: 5,
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

function renderPanel(onImport = vi.fn()) {
  return render(
    <Accordion type="single" collapsible value="data">
      <DataManagePanel
        state={baseState}
        onImport={onImport}
      />
    </Accordion>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DataManagePanel", () => {
  it("exports data and triggers download toasts success", async () => {
    const mockExport = { version: 1, exportedAt: "2026-03-31", categories: baseState.categories };
    exportDataMock.mockResolvedValue(mockExport);

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "导出到文件" }));

    await waitFor(() => {
      expect(downloadExportDataMock).toHaveBeenCalledWith(mockExport);
    });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "导出成功" }),
    );
  });

  it("shows toast when export fails", async () => {
    exportDataMock.mockRejectedValue(new Error("boom"));

    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "导出到文件" }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "导出失败", variant: "destructive" }),
      );
    });
  });

  it("shows import preview and confirms import", async () => {
    const importData = {
      version: 1,
      exportedAt: "2026-03-31",
      categories: [{ id: "cat-2", name: "Dev", links: [] }],
    };
    parseImportFileMock.mockReturnValue({
      data: importData,
      preview: { categoryCount: 1, linkCount: 0, hasUI: false, hasSearchSettings: false, hasAppearance: false },
    });
    executeImportMock.mockResolvedValue({
      categories: importData.categories,
      ui: baseState.ui,
    });
    const onImport = vi.fn();

    const { container } = renderPanel(onImport);
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const mockFile = createMockImportFile(JSON.stringify(importData));

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(await screen.findByRole("heading", { name: "确认导入" })).toBeInTheDocument();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("分类数量：1")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "确认导入" }));

    await waitFor(() => {
      expect(executeImportMock).toHaveBeenCalledWith(importData, "merge", baseState);
      expect(onImport).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: importData.categories,
        }),
      );
    });
  });

  it("reports invalid import files", async () => {
    parseImportFileMock.mockImplementation(() => {
      throw new Error("bad file");
    });

    const { container } = renderPanel();
    const fileInput = container.querySelector("input[type='file']") as HTMLInputElement;
    const mockFile = createMockImportFile("bad", "bad.json");

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "文件解析失败", variant: "destructive" }),
      );
    });
  });
});


