import { useCallback, useEffect, useId, useRef, useState } from "react";

import { toast } from "@/shared/ui/primitives/use-toast";

import {
  APPEARANCE_BG_KEY,
  getBackgroundImageDataUrl,
  removeBackgroundImage,
  setBackgroundImageDataUrl,
} from "../lib/backgroundImageStore";
import {
  getCurrentAppearance,
  defaultAppearance,
  loadAppearance,
  saveAppearance,
  setCurrentAppearance,
  subscribeAppearance,
  type AppearanceSettings,
} from "../lib/appearance";

type PersistOptions = {
  bgDataUrl?: string | null;
  bgTouched?: boolean;
};

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : null);
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error("读取图片失败"));
    };
    reader.readAsDataURL(file);
  });
}

export function useAppearancePanel() {
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => getCurrentAppearance());
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const bgPreviewRef = useRef<string | null>(null);
  const bgInputId = useId();
  const bgInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return subscribeAppearance((next) => {
      setAppearance(next);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const loaded = await loadAppearance();
        if (cancelled) return;

        const bgKey = loaded.backgroundImageKey ?? null;
        const bg = bgKey ? await getBackgroundImageDataUrl(bgKey) : null;
        if (cancelled) return;

        setBgPreview(bg);
        bgPreviewRef.current = bg;

        await setCurrentAppearance(loaded, { persist: false, backgroundImageDataUrl: bg });
      } catch (error) {
        console.warn("Failed to load appearance", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (
    next: AppearanceSettings,
    opts?: PersistOptions,
  ) => {
    const bgTouched = opts?.bgTouched === true;
    const bg = bgTouched ? (opts?.bgDataUrl ?? null) : bgPreviewRef.current;

    const toSave: AppearanceSettings = {
      ...next,
      backgroundImageKey: bgTouched ? (bg ? APPEARANCE_BG_KEY : null) : next.backgroundImageKey,
    };

    void setCurrentAppearance(toSave, {
      persist: false,
      ...(bgTouched ? { backgroundImageDataUrl: bg } : {}),
    });

    if (bgTouched) {
      bgPreviewRef.current = bg;
      setBgPreview(bg);
    }

    try {
      if (bgTouched) {
        if (bg) await setBackgroundImageDataUrl(APPEARANCE_BG_KEY, bg);
        else await removeBackgroundImage(APPEARANCE_BG_KEY);
      }
      await saveAppearance(toSave);
    } catch (error) {
      console.warn("Failed to auto-save appearance", error);
      toast({
        title: "外观保存失败",
        description: "可能是背景图过大或浏览器存储受限。可尝试移除背景图。",
      });
    }
  }, []);

  const openBackgroundPicker = useCallback(() => {
    bgInputRef.current?.click();
  }, []);

  const removeBackground = useCallback(() => {
    bgPreviewRef.current = null;
    void persist(
      { ...appearance, backgroundImageKey: null },
      { bgTouched: true, bgDataUrl: null },
    );
  }, [appearance, persist]);

  const resetAppearance = useCallback(() => {
    bgPreviewRef.current = null;
    void persist(defaultAppearance(), { bgTouched: true, bgDataUrl: null });
  }, [persist]);

  const handleBackgroundFileChange = useCallback((file: File | null) => {
    if (!file) return;

    void (async () => {
      try {
        const dataUrl = await readFileAsDataUrl(file);
        if (!dataUrl) return;

        bgPreviewRef.current = dataUrl;
        void persist(
          { ...appearance, backgroundImageKey: APPEARANCE_BG_KEY },
          { bgTouched: true, bgDataUrl: dataUrl },
        );

        toast({
          title: "背景图片已设置",
          description: "已保存",
        });
      } catch (error) {
        toast({
          title: "图片处理失败",
          description: error instanceof Error ? error.message : "未知错误",
          variant: "destructive",
        });
      }
    })();
  }, [appearance, persist]);

  return {
    appearance,
    bgPreview,
    bgInputId,
    bgInputRef,
    persist,
    openBackgroundPicker,
    removeBackground,
    resetAppearance,
    handleBackgroundFileChange,
  };
}
