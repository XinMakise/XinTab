import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

export const DEFAULT_POINTER_ACTIVATION_DISTANCE = 8;

export function useDefaultPointerSensors(distance = DEFAULT_POINTER_ACTIVATION_DISTANCE) {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance },
    }),
  );
}
