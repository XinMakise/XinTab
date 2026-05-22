import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EditLinkDialog } from "@/features/manual-nav/ui/EditLinkDialog";
import { getSuggestedSiteTitle } from "@/entities/link";
import type { SiteLink } from "@/shared/types/link";

vi.mock("@/features/manual-nav/ui/SiteLinkIconEditor", () => ({
  SiteLinkIconEditor: () => <div data-testid="icon-editor" />,
}));

const baseLink: SiteLink = {
  id: "link-1",
  title: "original",
  url: "https://original.com",
};

function ControlledEditLinkDialog({
  link = baseLink,
  onSave,
}: {
  link?: SiteLink;
  onSave: (link: SiteLink) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        重新打开
      </button>
      <EditLinkDialog link={link} open={open} onOpenChange={setOpen} onSave={onSave} />
    </>
  );
}

describe("EditLinkDialog", () => {
  it("normalizes url changes, auto-fills title when not manually edited, and keeps manual overrides", async () => {
    const onSave = vi.fn();
    render(<ControlledEditLinkDialog onSave={onSave} />);

    const urlInput = screen.getByLabelText("网址");
    const titleInput = screen.getByLabelText("名称");

    fireEvent.change(urlInput, { target: { value: "example.com/page" } });
    await waitFor(() => {
      expect(titleInput).toHaveValue(getSuggestedSiteTitle("https://example.com/page"));
    });

    fireEvent.change(titleInput, { target: { value: "Hand Tuned" } });
    fireEvent.change(urlInput, { target: { value: "another-site.com" } });
    expect(titleInput).toHaveValue("Hand Tuned");

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...baseLink,
        title: "Hand Tuned",
        url: "https://another-site.com",
        icon: undefined,
      });
    });
  });

  it("disables save when the url is cleared", () => {
    render(<ControlledEditLinkDialog onSave={() => {}} />);

    const saveButton = screen.getByRole("button", { name: "保存" });
    expect(saveButton).toBeEnabled();

    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "" } });

    expect(saveButton).toBeDisabled();
  });

  it("restores the original values after close and reopen", async () => {
    render(<ControlledEditLinkDialog onSave={() => {}} />);

    fireEvent.change(screen.getByLabelText("网址"), { target: { value: "changed.com" } });
    fireEvent.change(screen.getByLabelText("名称"), { target: { value: "Changed" } });

    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    fireEvent.click(screen.getByRole("button", { name: "重新打开" }));

    await waitFor(() => {
      expect(screen.getByLabelText("网址")).toHaveValue(baseLink.url);
      expect(screen.getByLabelText("名称")).toHaveValue(baseLink.title);
    });
  });
});


