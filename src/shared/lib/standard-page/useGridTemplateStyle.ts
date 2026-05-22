import { useMemo } from "react";

export function useGridTemplateStyle(columnsPerRow: number) {
  return useMemo(
    () => ({ gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))` }),
    [columnsPerRow],
  );
}
