import { useCallback, useEffect, useState } from "react";

import { hasChromeHistory } from "@/shared/browser/chrome";
import { getRecentVisitItems } from "@/features/recent-visits";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

type Options = {
  enabled: boolean;
  count: number;
};

export const useRecentVisits = ({ enabled, count }: Options) => {
  const historyAvailable = hasChromeHistory();
  const [recentVisits, setRecentVisits] = useState<RecentVisitItem[]>([]);

  const loadRecentVisits = useCallback(async () => {
    if (!historyAvailable) {
      setRecentVisits([]);
      return;
    }

    try {
      const items = await getRecentVisitItems(count);
      setRecentVisits(items);
    } catch (error) {
      console.warn("Failed to load recent visits", error);
      setRecentVisits([]);
    }
  }, [count, historyAvailable]);

  useEffect(() => {
    if (!historyAvailable || !enabled) {
      setRecentVisits([]);
      return;
    }

    void loadRecentVisits();
  }, [enabled, historyAvailable, loadRecentVisits]);

  useEffect(() => {
    if (!historyAvailable || !enabled) return;

    const refresh = () => {
      void loadRecentVisits();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, historyAvailable, loadRecentVisits]);

  return { recentVisits, historyAvailable };
};


