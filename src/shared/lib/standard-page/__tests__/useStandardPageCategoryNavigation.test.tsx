import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStandardPageCategoryNavigation } from "@/shared/lib/standard-page/useStandardPageCategoryNavigation";
import { useWheelCategorySwitch } from "@/shared/lib/standard-page/useWheelCategorySwitch";

vi.mock("@/shared/lib/standard-page/useWheelCategorySwitch", () => ({
  useWheelCategorySwitch: vi.fn(),
}));

const items = [
  { id: "cat-a" },
  { id: "cat-b" },
];

describe("useStandardPageCategoryNavigation", () => {
  it("falls back to the first item when active id is missing", () => {
    const onChange = vi.fn();

    const { result } = renderHook(() =>
      useStandardPageCategoryNavigation({
        items,
        activeId: "missing",
        onChange,
        wheelEnabled: true,
      }),
    );

    expect(result.current.activeItem?.id).toBe("cat-a");
    expect(onChange).toHaveBeenCalledWith("cat-a");
    expect(useWheelCategorySwitch).toHaveBeenCalled();
  });

  it("scrolls the selected item into view when navigation changes", () => {
    const onChange = vi.fn();
    const scrollIntoView = vi.fn();

    const { result } = renderHook(() =>
      useStandardPageCategoryNavigation({
        items,
        activeId: "cat-a",
        onChange,
        wheelEnabled: true,
        scrollOnChange: true,
      }),
    );

    const nav = document.createElement("div");
    const button = document.createElement("button");
    button.setAttribute("data-category-id", "cat-b");
    button.scrollIntoView = scrollIntoView;
    nav.appendChild(button);

    act(() => {
      result.current.categoryNavRef.current = nav;
      result.current.handleActiveItemChange("cat-b");
    });

    expect(onChange).toHaveBeenCalledWith("cat-b");
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });
});
