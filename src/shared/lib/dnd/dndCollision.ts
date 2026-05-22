import {
  closestCenter,
  type Collision,
  pointerWithin,
  type CollisionDescriptor,
  type CollisionDetection,
} from "@dnd-kit/core";

import {
  parseQeManualCategoryId,
  parseQeNavLinkId,
} from "./dndUtils";

type CategoryFirstCollisionOptions = {
  enableCategoryBarZone?: boolean;
  recentLinkUsesContainerPointer?: boolean;
};

export function createCategoryFirstCollisionDetection(
  {
    enableCategoryBarZone = false,
    recentLinkUsesContainerPointer = false,
  }: CategoryFirstCollisionOptions = {},
): CollisionDetection {
  return (args) => {
    const { active, droppableContainers } = args;
    const activeType = active.data.current?.type;
    const categoryButtonDroppables = droppableContainers.filter(
      (container) => container.data.current?.categoryId != null,
    );
    const cardGridContainers = droppableContainers.filter(
      (container) =>
        container.data.current?.type === "container" &&
        container.data.current?.categoryId == null,
    );

    const categoryCollisions = pointerWithin({
      ...args,
      droppableContainers: categoryButtonDroppables,
    });

    const categoryBarZoneCollisions = enableCategoryBarZone
      ? pointerWithin({
          ...args,
          droppableContainers: droppableContainers.filter(
            (container) => container.data.current?.type === "category-bar-zone",
          ),
        })
      : [];
    const closestCategoryButtonCollisions = enableCategoryBarZone
      ? closestCenter({
          ...args,
          droppableContainers: categoryButtonDroppables,
        })
      : [];

    if (activeType === "recent-link" && recentLinkUsesContainerPointer) {
      if (categoryCollisions.length > 0) {
        return categoryCollisions;
      }

      if (categoryBarZoneCollisions.length > 0) {
        return closestCategoryButtonCollisions;
      }

      const containerCollisions = pointerWithin({
        ...args,
        droppableContainers: cardGridContainers,
      });

      if (containerCollisions.length > 0) {
        const linkCollisions = getPointerScopedStandardLinkCollisions({
          ...args,
          hoveredContainerId: containerCollisions[0]?.id,
        });

        return linkCollisions.length > 0 ? linkCollisions : containerCollisions;
      }

      return [];
    }

    if (activeType !== "category-button") {
      if (categoryCollisions.length > 0) {
        return categoryCollisions;
      }

      if (categoryBarZoneCollisions.length > 0) {
        return closestCategoryButtonCollisions;
      }

      const containerCollisions = pointerWithin({
        ...args,
        droppableContainers: cardGridContainers,
      });

      if (containerCollisions.length > 0) {
        const linkCollisions = getPointerScopedStandardLinkCollisions({
          ...args,
          hoveredContainerId: containerCollisions[0]?.id,
        });

        return linkCollisions.length > 0 ? linkCollisions : containerCollisions;
      }

      return [];
    }

    return closestCenter(args);
  };
}

export function createQuickEditCollisionDetection(): CollisionDetection {
  return (args) => {
    const { active, droppableContainers, droppableRects, pointerCoordinates } = args;
    const manualCategoryContainers = droppableContainers.filter(
      (container) => parseQeManualCategoryId(container.id) != null,
    );
    const categoryCollisions = pointerWithin({
      ...args,
      droppableContainers: manualCategoryContainers,
    });

    if (categoryCollisions.length === 0) {
      return [];
    }

    const hoveredCategoryId = parseQeManualCategoryId(categoryCollisions[0]?.id);
    if (!hoveredCategoryId || !pointerCoordinates) {
      return categoryCollisions;
    }

    const navLinkContainers = droppableContainers.filter((container) => {
      const navLink = parseQeNavLinkId(container.id);
      return navLink?.categoryId === hoveredCategoryId;
    });

    if (navLinkContainers.length === 0) {
      return categoryCollisions;
    }

    const navTargetEntries = navLinkContainers
      .map((container) => {
        const rect = droppableRects.get(container.id);
        return rect
          ? {
              id: container.id,
              container,
              centerY: rect.top + rect.height / 2,
            }
          : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry != null)
      .sort((a, b) => a.centerY - b.centerY);

    if (navTargetEntries.length === 0) {
      return categoryCollisions;
    }

    const activeType = active.data.current?.type;
    const activeNav = parseQeNavLinkId(active.id);
    const lastEntry = navTargetEntries[navTargetEntries.length - 1];

    if (pointerCoordinates.y >= lastEntry.centerY) {
      const shouldAppendToCategory =
        activeType === "bookmark-link" ||
        (activeType === "nav-link" && activeNav?.categoryId !== hoveredCategoryId);

      return shouldAppendToCategory
        ? categoryCollisions
        : [buildQuickEditCollision(lastEntry.id, lastEntry.container)];
    }

    const nextEntry = navTargetEntries.find((entry) => pointerCoordinates.y < entry.centerY);
    return nextEntry
      ? [buildQuickEditCollision(nextEntry.id, nextEntry.container)]
      : categoryCollisions;
  };
}

function buildQuickEditCollision(
  id: CollisionDescriptor["id"],
  droppableContainer: CollisionDescriptor["data"]["droppableContainer"],
): CollisionDescriptor {
  return {
    id,
    data: {
      droppableContainer,
      value: 0,
    },
  };
}

function getPointerScopedStandardLinkCollisions(
  args: Parameters<CollisionDetection>[0] & {
    hoveredContainerId: CollisionDescriptor["id"] | null | undefined;
  },
): Collision[] {
  const {
    droppableContainers,
    droppableRects,
    hoveredContainerId,
    pointerCoordinates,
  } = args;

  if (!hoveredContainerId) {
    return [];
  }

  const scopedLinkContainers = droppableContainers.filter(
    (container) =>
      container.data.current?.type === "link" &&
      container.data.current?.sortable?.containerId === hoveredContainerId,
  );

  if (scopedLinkContainers.length === 0) {
    return [];
  }

  const directLinkCollisions = pointerWithin({
    ...args,
    droppableContainers: scopedLinkContainers,
  });

  if (directLinkCollisions.length > 0 || !pointerCoordinates) {
    return directLinkCollisions;
  }

  const centerDistanceCollisions = scopedLinkContainers
    .map((container) => {
      const rect = droppableRects.get(container.id);
      if (!rect) return null;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      return buildCollisionDescriptor(
        container.id,
        container,
        Math.hypot(pointerCoordinates.x - centerX, pointerCoordinates.y - centerY),
      );
    })
    .filter((entry): entry is CollisionDescriptor => entry != null)
    .sort((a, b) => a.data.value - b.data.value);

  if (centerDistanceCollisions.length > 0) {
    return centerDistanceCollisions;
  }

  const fallbackCollisions = closestCenter({
    ...args,
    droppableContainers: scopedLinkContainers,
  });

  return fallbackCollisions;
}

function buildCollisionDescriptor(
  id: CollisionDescriptor["id"],
  droppableContainer: CollisionDescriptor["data"]["droppableContainer"],
  value: number,
): CollisionDescriptor {
  return {
    id,
    data: {
      droppableContainer,
      value,
    },
  };
}
