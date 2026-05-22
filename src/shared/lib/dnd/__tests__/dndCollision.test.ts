import { describe, expect, it } from "vitest";
import type { CollisionDetection } from "@dnd-kit/core";

import {
  createCategoryFirstCollisionDetection,
  createQuickEditCollisionDetection,
} from "@/shared/lib/dnd/dndCollision";
import {
  dndContainerId,
  dndLinkId,
  qeBookmarkLinkId,
  qeManualCategoryId,
  qeNavLinkId,
} from "@/shared/lib/dnd/dndUtils";

type QuickEditCollisionArgs = Parameters<CollisionDetection>[0];

function buildRect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function buildQuickEditArgs({
  activeId,
  activeType,
  pointerY,
}: {
  activeId: string;
  activeType: "bookmark-link" | "nav-link";
  pointerY: number;
}) {
  const catAId = qeManualCategoryId("cat-a");
  const catBId = qeManualCategoryId("cat-b");
  const catALink1 = qeNavLinkId("cat-a", "link-1");
  const catALink2 = qeNavLinkId("cat-a", "link-2");
  const catBLink1 = qeNavLinkId("cat-b", "link-3");

  const droppableContainers = [
    { id: catAId, data: { current: {} } },
    { id: catBId, data: { current: {} } },
    { id: catALink1, data: { current: {} } },
    { id: catALink2, data: { current: {} } },
    { id: catBLink1, data: { current: {} } },
  ] as const;

  const droppableRects = new Map([
    [catAId, buildRect(0, 0, 240, 240)],
    [catBId, buildRect(260, 0, 240, 240)],
    [catALink1, buildRect(12, 48, 216, 32)],
    [catALink2, buildRect(12, 88, 216, 32)],
    [catBLink1, buildRect(272, 48, 216, 32)],
  ]);

  return {
    active: {
      id: activeId,
      data: {
        current: {
          type: activeType,
        },
      },
    },
    collisionRect: buildRect(0, pointerY, 216, 32),
    droppableRects,
    droppableContainers: droppableContainers as QuickEditCollisionArgs["droppableContainers"],
    pointerCoordinates: { x: 24, y: pointerY },
  } as const;
}

function buildStandardArgs({
  activeId,
  activeType,
  pointerCoordinates,
  collisionRect,
}: {
  activeId: string;
  activeType: "nav-link" | "recent-link";
  pointerCoordinates: { x: number; y: number };
  collisionRect: ReturnType<typeof buildRect>;
}) {
  const catAId = dndContainerId("cat-a");
  const catBId = dndContainerId("cat-b");
  const link1Id = dndLinkId("link-1");
  const link2Id = dndLinkId("link-2");
  const link3Id = dndLinkId("link-3");

  const droppableContainers = [
    { id: catAId, data: { current: { type: "container" } } },
    { id: catBId, data: { current: { type: "container" } } },
    { id: link1Id, data: { current: { type: "link", sortable: { containerId: catAId } } } },
    { id: link2Id, data: { current: { type: "link", sortable: { containerId: catAId } } } },
    { id: link3Id, data: { current: { type: "link", sortable: { containerId: catBId } } } },
  ] as const;

  const droppableRects = new Map([
    [catAId, buildRect(0, 0, 240, 200)],
    [catBId, buildRect(260, 0, 240, 200)],
    [link1Id, buildRect(12, 48, 100, 64)],
    [link2Id, buildRect(124, 48, 100, 64)],
    [link3Id, buildRect(272, 48, 100, 64)],
  ]);

  return {
    active: {
      id: activeId,
      data: {
        current: {
          type: activeType,
        },
      },
    },
    collisionRect,
    droppableRects,
    droppableContainers: droppableContainers as QuickEditCollisionArgs["droppableContainers"],
    pointerCoordinates,
  } as const;
}

describe("dndCollision", () => {
  it("scopes standard-page link collisions to the hovered category container", () => {
    const detect = createCategoryFirstCollisionDetection();

    const collisions = detect(
      buildStandardArgs({
        activeId: dndLinkId("link-1"),
        activeType: "nav-link",
        pointerCoordinates: { x: 36, y: 72 },
        collisionRect: buildRect(280, 48, 100, 64),
      }),
    );

    expect(collisions[0]?.id).toBe(dndLinkId("link-1"));
  });

  it("uses hovered-category link centers for standard-page cross-row movement", () => {
    const detect = createCategoryFirstCollisionDetection();

    const collisions = detect(
      buildStandardArgs({
        activeId: dndLinkId("link-1"),
        activeType: "nav-link",
        pointerCoordinates: { x: 188, y: 72 },
        collisionRect: buildRect(0, 132, 100, 64),
      }),
    );

    expect(collisions[0]?.id).toBe(dndLinkId("link-2"));
  });

  it("uses pointer position to choose the next Quick Edit slot while reordering", () => {
    const detect = createQuickEditCollisionDetection();

    const collisions = detect(
      buildQuickEditArgs({
        activeId: qeNavLinkId("cat-a", "link-1"),
        activeType: "nav-link",
        pointerY: 86,
      }),
    );

    expect(collisions[0]?.id).toBe(qeNavLinkId("cat-a", "link-2"));
  });

  it("returns the category container when a bookmark is dragged below the last link", () => {
    const detect = createQuickEditCollisionDetection();

    const collisions = detect(
      buildQuickEditArgs({
        activeId: qeBookmarkLinkId("bookmark-1"),
        activeType: "bookmark-link",
        pointerY: 130,
      }),
    );

    expect(collisions[0]?.id).toBe(qeManualCategoryId("cat-a"));
  });

  it("keeps the last link as the target when reordering within the same category tail", () => {
    const detect = createQuickEditCollisionDetection();

    const collisions = detect(
      buildQuickEditArgs({
        activeId: qeNavLinkId("cat-a", "link-1"),
        activeType: "nav-link",
        pointerY: 130,
      }),
    );

    expect(collisions[0]?.id).toBe(qeNavLinkId("cat-a", "link-2"));
  });

  it("returns the target category tail when a nav link is dragged into another category bottom area", () => {
    const detect = createQuickEditCollisionDetection();

    const collisions = detect({
      ...buildQuickEditArgs({
        activeId: qeNavLinkId("cat-a", "link-1"),
        activeType: "nav-link",
        pointerY: 130,
      }),
      pointerCoordinates: { x: 284, y: 130 },
      collisionRect: buildRect(260, 130, 216, 32),
    });

    expect(collisions[0]?.id).toBe(qeManualCategoryId("cat-b"));
  });
});
