import { defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { describe, expect, it } from "vitest";

import { standardPageCardAnimateLayoutChanges } from "@/shared/ui/links/sortableLinkCardAnimateLayoutChanges";

const baseArgs = {
  active: null,
  containerId: "cat-a",
  isDragging: false,
  isSorting: true,
  id: "link:link-1",
  index: 0,
  items: ["link:link-1", "link:link-2"],
  previousItems: ["link:link-1", "link:link-2"],
  previousContainerId: "cat-a",
  newIndex: 1,
  transition: { duration: 200, easing: "ease" },
  wasDragging: false,
} as const;

describe("standardPageCardAnimateLayoutChanges", () => {
  it("disables layout animation after drag sorting has completed", () => {
    expect(
      standardPageCardAnimateLayoutChanges({
        ...baseArgs,
        wasDragging: true,
        isSorting: false,
      }),
    ).toBe(false);
  });

  it("keeps the default sortable layout animation while sorting is active", () => {
    const args = {
      ...baseArgs,
      wasDragging: true,
      isSorting: true,
    };

    expect(standardPageCardAnimateLayoutChanges(args)).toBe(defaultAnimateLayoutChanges(args));
  });
});
