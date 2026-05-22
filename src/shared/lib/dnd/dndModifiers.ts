import type { Modifier } from "@dnd-kit/core";
import { getEventCoordinates } from "@dnd-kit/utilities";

export const snapOverlayToCursorCenter: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  overlayNodeRect,
  transform,
}) => {
  const activeRect = overlayNodeRect ?? draggingNodeRect;

  if (!activeRect || !activatorEvent) {
    return transform;
  }

  const activatorCoordinates = getEventCoordinates(activatorEvent);

  if (!activatorCoordinates) {
    return transform;
  }

  const offsetX = activatorCoordinates.x - activeRect.left;
  const offsetY = activatorCoordinates.y - activeRect.top;

  return {
    ...transform,
    x: transform.x + offsetX - activeRect.width / 2,
    y: transform.y + offsetY - activeRect.height / 2,
  };
};
