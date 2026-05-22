import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditBookmarkDialog } from "@/features/bookmarks/ui/EditBookmarkDialog";
import { getSuggestedSiteTitle } from "@/entities/link";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const categories: Category[] = [
  { id: "cat-1", name: "常用", links: [] },
  { id: "cat-2", name: "开发", links: [] },
];

const baseLink: SiteLink = {
  id: "bookmark-1",
  title: "original",
  url: "https://original.com",
};

function ControlledEditBookmarkDialog({
  link = baseLink,
  categoryId = "cat-1",
  onSave,
}: {
  link?: SiteLink;
  categoryId?: string;
  onSave: (link: SiteLink, categoryId: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        重新打开
      </button>
      <EditBookmarkDialog
        link={link}
        categories={categories}
        categoryId={categoryId}
        open={open}
        onOpenChange={setOpen}
        onSave={onSave}
      />
    </>
  );
}

describe("EditBookmarkDialog", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("normalizes url changes, keeps manual title overrides, and saves the target category", async () => {
    const onSave = vi.fn();
    render(<ControlledEditBookmarkDialog onSave={onSave} />);

    const urlInput = screen.getByLabelText("网址");
    const titleInput = screen.getByLabelText("名称");

    fireEvent.change(urlInput, { target: { value: "example.com/page" } });
    await waitFor(() => {
      expect(titleInput).toHaveValue(getSuggestedSiteTitle("https://example.com/page"));
    });

    fireEvent.change(titleInput, { target: { value: "Hand Tuned" } });
    fireEvent.change(urlInput, { target: { value: "another-site.com" } });
    expect(titleInput).toHaveValue("Hand Tuned");

    const selectTrigger = screen.getByRole("combobox");
    fireEvent.keyDown(selectTrigger, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "开发" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "开发" }));

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        {
          ...baseLink,
          title: "Hand Tuned",
          url: "https://another-site.com",
        },
        "cat-2",
      );
    });
  });

  it("disables save when the url is cleared", () => {
    render(<ControlledEditBookmarkDialog onSave={() => {}} />);

    const saveButton = screen.getByRole("button", { name: "保存" });
    expect(saveButton).toBeEnabled();

    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "" } });

    expect(saveButton).toBeDisabled();
  });

  it("restores the original values and category after close and reopen", async () => {
    render(<ControlledEditBookmarkDialog onSave={() => {}} />);

    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "changed.com" } });
    fireEvent.change(screen.getByLabelText("名称"), { target: { value: "Changed" } });

    const selectTrigger = screen.getByRole("combobox");
    fireEvent.keyDown(selectTrigger, { key: "ArrowDown" });
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "开发" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "开发" }));

    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    fireEvent.click(screen.getByRole("button", { name: "重新打开" }));

    await waitFor(() => {
      expect(screen.getByLabelText("网址")).toHaveValue(baseLink.url);
      expect(screen.getByLabelText("名称")).toHaveValue(baseLink.title);
    });
    expect(screen.getByRole("combobox")).toHaveTextContent("常用");
  });
});


