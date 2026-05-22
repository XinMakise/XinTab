import type { Category } from "./category";

export type ManualNavState = {
  categories: Category[];
  ui?: {
    categoryLayout?: "top" | "left" | "all";
    maxVisibleRows?: number;
    columnsPerRow?: number;
    showRecentVisits?: boolean;
    recentVisitsRows?: number;
    recentVisitsCount?: number;
    recentVisitsCardSize?: number;
    hiddenRecentVisitIds?: string[];
  };
};
