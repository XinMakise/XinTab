import { useGridTemplateStyle } from "./useGridTemplateStyle";
import { useStandardPageCategoryNavigation } from "./useStandardPageCategoryNavigation";

type StandardPageLayoutItem = {
  id: string;
};

type UseStandardPageLayoutStateOptions<T extends StandardPageLayoutItem> = {
  items: T[];
  activeId?: string;
  onChange: (id: string) => void;
  layout: "top" | "left" | "all";
  columnsPerRow: number;
  scrollOnChange?: boolean;
};

export function useStandardPageLayoutState<T extends StandardPageLayoutItem>({
  items,
  activeId,
  onChange,
  layout,
  columnsPerRow,
  scrollOnChange = false,
}: UseStandardPageLayoutStateOptions<T>) {
  const gridStyle = useGridTemplateStyle(columnsPerRow);
  const navigation = useStandardPageCategoryNavigation({
    items,
    activeId,
    onChange,
    wheelEnabled: layout !== "all",
    scrollOnChange,
  });

  return {
    gridStyle,
    ...navigation,
  };
}
