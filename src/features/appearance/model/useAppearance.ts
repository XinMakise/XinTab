import { useEffect, useState } from "react";

import { getBackgroundImageDataUrl } from "../lib/backgroundImageStore";
import {
  defaultAppearance,
  loadAppearance,
  setCurrentAppearance,
  subscribeAppearance,
  type AppearanceSettings,
} from "../lib/appearance";

let initialized = false;
let initPromise: Promise<void> | null = null;

async function initializeAppearance(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const settings = await loadAppearance();
    const bgKey = settings.backgroundImageKey ?? null;
    const bg = bgKey ? await getBackgroundImageDataUrl(bgKey) : null;
    await setCurrentAppearance(settings, { persist: false, backgroundImageDataUrl: bg });
    initialized = true;
  })();

  return initPromise;
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<AppearanceSettings>(defaultAppearance);
  const [isReady, setIsReady] = useState(initialized);

  useEffect(() => {
    let cancelled = false;

    initializeAppearance().then(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    }).catch(() => {
      if (!cancelled) {
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAppearance((next) => {
      setAppearance(next);
    });
    return unsubscribe;
  }, []);

  return { appearance, isReady };
}
