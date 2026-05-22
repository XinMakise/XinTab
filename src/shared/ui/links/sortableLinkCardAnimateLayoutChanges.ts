import {
  defaultAnimateLayoutChanges,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";

export const standardPageCardAnimateLayoutChanges: AnimateLayoutChanges = (args) => {
  if (args.wasDragging && !args.isSorting) {
    return false;
  }

  return defaultAnimateLayoutChanges(args);
};
