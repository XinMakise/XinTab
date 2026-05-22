import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AddWebsiteDialog } from "@/features/manual-nav/ui/AddWebsiteDialog";
import { shouldUseCompactAddWebsiteCard } from "@/features/manual-nav/lib/addWebsiteLayout";
import { getSuggestedSiteTitle } from "@/entities/link";

vi.mock("@/features/manual-nav/ui/SiteLinkIconEditor", () => ({
  SiteLinkIconEditor: () => <div data-testid="icon-editor" />,
}));

const categories = [
  { id: "cat-1", name: "Primary", links: [] },
  { id: "cat-2", name: "Secondary", links: [] },
];

describe("AddWebsiteDialog", () => {
  it("switches to compact mode when the full label cannot fit horizontally", () => {
    expect(shouldUseCompactAddWebsiteCard(60, 72)).toBe(true);
    expect(shouldUseCompactAddWebsiteCard(96, 72)).toBe(false);
  });

  it("normalizes the URL, auto-fills titles, respects manual overrides, and uses normalized values on submit", async () => {
    const onAdd = vi.fn();
    render(
      <AddWebsiteDialog
        categories={categories}
        onAdd={onAdd}
        trigger={<button type="button">打开添加网站</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开添加网站" }));

    const urlInput = screen.getByLabelText("网址");
    fireEvent.change(urlInput, { target: { value: "example.com/page" } });

    const titleInput = screen.getByLabelText("名称（可选）");
    await waitFor(() => {
      expect(titleInput).toHaveValue(getSuggestedSiteTitle("https://example.com/page"));
    });

    fireEvent.change(titleInput, { target: { value: "Custom Name" } });
    fireEvent.change(urlInput, { target: { value: "another-site.com" } });
    expect(titleInput).toHaveValue("Custom Name");

    fireEvent.click(screen.getByRole("button", { name: "添加" }));

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledTimes(1);
      expect(onAdd).toHaveBeenCalledWith(
        "cat-1",
        expect.objectContaining({
          url: "https://another-site.com",
          title: "Custom Name",
        }),
      );
    });
  });

  it("disables submit until a normalized URL exists and keeps submit disabled for invalid input", async () => {
    render(
      <AddWebsiteDialog
        categories={categories}
        onAdd={() => {}}
        trigger={<button type="button">打开添加网站</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开添加网站" }));

    const addButton = screen.getByRole("button", { name: "添加" });
    expect(addButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "https://valid.com" } });
    await waitFor(() => expect(addButton).toBeEnabled());
  });

  it("resets fields when the dialog is closed", async () => {
    render(
      <AddWebsiteDialog
        categories={categories}
        onAdd={() => {}}
        trigger={<button type="button">打开添加网站</button>}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开添加网站" }));
    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "abc.com" } });
    fireEvent.change(screen.getByLabelText("名称（可选）"), { target: { value: "Foo" } });

    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    fireEvent.click(screen.getByRole("button", { name: "打开添加网站" }));

    expect(screen.getByLabelText("网址")).toHaveValue("");
    expect(screen.getByLabelText("名称（可选）")).toHaveValue("");
  });
});

