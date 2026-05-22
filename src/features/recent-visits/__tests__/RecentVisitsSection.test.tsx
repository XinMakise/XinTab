import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RecentVisitsSection } from "@/features/recent-visits/ui/RecentVisitsSection";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

function buildVisit(id: string): RecentVisitItem {
  return {
    id,
    title: `Site ${id}`,
    url: `https://example.com/${id}`,
    origin: `https://example.com`,
    lastVisitedAt: Date.now(),
  };
}

afterEach(() => {
  delete (HTMLElement.prototype as Partial<HTMLElement>).clientWidth;
});

describe("RecentVisitsSection", () => {
  it("renders the heading and cards for provided items", () => {
    const items = [buildVisit("a"), buildVisit("b")];
    render(<RecentVisitsSection items={items} cardSize={110} />);

    expect(screen.getByText("最近访问网站")).toBeInTheDocument();
    expect(screen.getByText("Site a")).toBeInTheDocument();
    expect(screen.getByText("Site b")).toBeInTheDocument();
  });

  it("applies the computed grid template columns based on cardSize", () => {
    const items = [buildVisit("x"), buildVisit("y")];
    render(<RecentVisitsSection items={items} cardSize={110} />);

    const section = screen.getByText("最近访问网站").closest("section");
    expect(section).toBeTruthy();
    const grid = section?.querySelector("div.grid");
    expect(grid).toHaveStyle("gridTemplateColumns: repeat(auto-fit, minmax(194px, 1fr))");
  });

  it("opens recent-visit cards in the current tab by default", () => {
    render(<RecentVisitsSection items={[buildVisit("z")]} />);

    const link = screen.getByRole("link", { name: /Site z/i });
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAttribute("href", "https://example.com/z");
  });

  it("removes a recent-visit card through the close button", () => {
    const onRemoveItem = vi.fn();

    render(<RecentVisitsSection items={[buildVisit("z")]} onRemoveItem={onRemoveItem} />);

    fireEvent.click(screen.getByRole("button", { name: "从首页隐藏 Site z" }));

    expect(onRemoveItem).toHaveBeenCalledWith("z");
  });

  it("limits visible cards by configured rows", () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 600,
    });

    render(
      <RecentVisitsSection
        items={[
          buildVisit("1"),
          buildVisit("2"),
          buildVisit("3"),
          buildVisit("4"),
        ]}
        rows={1}
        cardSize={100}
      />,
    );

    expect(screen.getByText("Site 1")).toBeInTheDocument();
    expect(screen.getByText("Site 2")).toBeInTheDocument();
    expect(screen.getByText("Site 3")).toBeInTheDocument();
    expect(screen.queryByText("Site 4")).not.toBeInTheDocument();
  });

  it("does not render when there are no items", () => {
    const { container } = render(<RecentVisitsSection items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

