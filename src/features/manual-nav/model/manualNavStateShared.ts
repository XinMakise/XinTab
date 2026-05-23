import {
  RECENT_VISITS_CARD_SIZE_MIN,
  normalizeRecentVisitsRows,
} from "@/features/recent-visits";
import type { ManualNavState } from "@/shared/types/manual-nav";

export const MANUAL_NAV_STORAGE_KEY = "manual_nav_v1";

export function normalizeHiddenRecentVisitIds(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0)),
  );
}

export const DEFAULT_MANUAL_NAV_UI = {
  categoryLayout: "left",
  showRecentVisits: true,
  recentVisitsRows: 1,
  recentVisitsCardSize: RECENT_VISITS_CARD_SIZE_MIN,
  hiddenRecentVisitIds: [],
  columnsPerRow: 6,
} satisfies NonNullable<ManualNavState["ui"]>;

export const DEFAULT_MANUAL_NAV_STATE: ManualNavState = {
  categories: [
    {
      id: "quick",
      name: "常用",
      links: [
        { id: "github", title: "GitHub", url: "https://github.com" },
        { id: "weibo", title: "微博", url: "https://weibo.com" },
        { id: "xiaohongshu", title: "小红书", url: "https://www.xiaohongshu.com" },
        { id: "bilibili", title: "哔哩哔哩", url: "https://www.bilibili.com" },
      ],
    },
  ],
  ui: DEFAULT_MANUAL_NAV_UI,
};

export function mergeLoadedManualNavState(saved: ManualNavState): ManualNavState {
  const { recentVisitsCount, ...savedUi } = saved.ui ?? {};

  return {
    ...DEFAULT_MANUAL_NAV_STATE,
    ...saved,
    ui: {
      ...DEFAULT_MANUAL_NAV_STATE.ui,
      ...savedUi,
      recentVisitsRows: normalizeRecentVisitsRows(saved.ui?.recentVisitsRows, recentVisitsCount),
      hiddenRecentVisitIds: normalizeHiddenRecentVisitIds(saved.ui?.hiddenRecentVisitIds),
    },
  };
}
