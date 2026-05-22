import type { UniqueIdentifier } from "@dnd-kit/core";

import { findCategoryIdByLinkIdFast } from "./categoryUtils";
import { parseDndContainerId, parseDndLinkId } from "./dndUtils";
import type { Category } from "@/shared/types/category";

type StandardOverData = {
  type?: unknown;
  categoryId?: unknown;
} | null | undefined;

export function isOverCategoryButton(overData: StandardOverData): boolean {
  return (
    overData?.type === "category-button" ||
    (overData?.type === "container" && typeof overData.categoryId === "string")
  );
}

export function resolveStandardDropCategoryId(
  overId: UniqueIdentifier | null | undefined,
  categoryById: Map<string, Category>,
  categories: Category[],
): string | null {
  if (!overId) return null;

  if (typeof overId === "string") {
    if (overId.startsWith("cat-btn:")) {
      return overId.slice(8);
    }
    if (overId.startsWith("cat:")) {
      return overId.slice(4);
    }
  }

  if (typeof overId === "string" && categoryById.has(overId)) {
    return overId;
  }

  const directContainerId = parseDndContainerId(overId);
  if (directContainerId) return directContainerId;

  const overLinkId = parseDndLinkId(overId);
  return overLinkId ? findCategoryIdByLinkIdFast(categories, overLinkId) : null;
}

