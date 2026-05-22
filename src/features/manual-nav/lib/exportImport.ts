import type { BookmarksUIState } from "@/shared/types/bookmarks";
import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import type { SearchSettings } from "@/shared/types/search";
import {
  defaultAppearance,
  loadAppearance,
  saveAppearance,
  setCurrentAppearance,
  type AppearanceSettings,
} from "@/features/appearance";
import {
  APPEARANCE_BG_KEY,
  getBackgroundImageDataUrl,
  setBackgroundImageDataUrl,
} from "@/features/appearance/lib/backgroundImageStore";
import { SEARCH_SETTINGS_KEY, defaultSearchSettings } from "@/features/search";
import { storage } from "@/shared/browser/storage";
import { normalizeSiteLinkIcon } from "@/entities/link";

const EXPORT_VERSION = 1;
const BOOKMARKS_UI_KEY = "bookmarks_ui_v1";

/**
 * 导出数据结构
 */
export type ExportData = {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  categories: Category[];
  ui?: ManualNavState["ui"];
  searchSettings?: SearchSettings;
  appearance?: AppearanceSettings;
  backgroundImage?: string;
  bookmarksUI?: BookmarksUIState;
};

/**
 * 导入模式
 */
export type ImportMode = "overwrite" | "merge";

/**
 * 导入预览信息
 */
export type ImportPreview = {
  categoryCount: number;
  linkCount: number;
  hasUI: boolean;
  hasSearchSettings: boolean;
  hasAppearance: boolean;
};

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 导出数据为 JSON
 */
export async function exportData(
  state: ManualNavState,
  includeAppearance = true,
  includeBackgroundImage = false,
): Promise<ExportData> {
  const searchSettings = await storage.get<SearchSettings>(SEARCH_SETTINGS_KEY);
  const appearance = includeAppearance ? await loadAppearance() : undefined;
  const backgroundImage =
    includeBackgroundImage ? (await getBackgroundImageDataUrl(APPEARANCE_BG_KEY)) ?? undefined : undefined;

  const bookmarksUI = await storage.get<BookmarksUIState>(BOOKMARKS_UI_KEY);

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    categories: state.categories,
    ui: state.ui,
    searchSettings: searchSettings ?? undefined,
    appearance: appearance ?? undefined,
    backgroundImage,
    bookmarksUI: bookmarksUI ?? undefined,
  };
}

/**
 * 将导出数据转换为 JSON 字符串并触发下载
 */
export function downloadExportData(data: ExportData, filename?: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `my-favorites-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 解析导入文件并返回预览信息
 */
export function parseImportFile(jsonString: string): { data: ExportData; preview: ImportPreview } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("无效的 JSON 格式");
  }

  // 验证基本结构
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("无效的数据格式");
  }

  const data = parsed as Record<string, unknown>;

  // 验证版本
  if (typeof data.version !== "number") {
    throw new Error("缺少版本号");
  }
  if (data.version > EXPORT_VERSION) {
    throw new Error(`不支持的版本号: ${data.version}，当前支持最高版本: ${EXPORT_VERSION}`);
  }

  // 验证 categories
  if (!Array.isArray(data.categories)) {
    throw new Error("缺少分类数据");
  }

  // 验证每个分类
  for (const cat of data.categories) {
    if (typeof cat !== "object" || cat === null) {
      throw new Error("分类数据格式错误");
    }
    const category = cat as Record<string, unknown>;
    if (typeof category.id !== "string" || typeof category.name !== "string") {
      throw new Error("分类缺少必要字段 (id, name)");
    }
    if (!Array.isArray(category.links)) {
      throw new Error("分类缺少 links 数组");
    }
    // 验证链接
    for (const link of category.links as unknown[]) {
      if (typeof link !== "object" || link === null) {
        throw new Error("链接数据格式错误");
      }
      const l = link as Record<string, unknown>;
      if (typeof l.id !== "string" || typeof l.title !== "string" || typeof l.url !== "string") {
        throw new Error("链接缺少必要字段 (id, title, url)");
      }
      if ("icon" in l && l.icon !== undefined && !normalizeSiteLinkIcon(l.icon as never)) {
        throw new Error("链接 icon 字段格式错误");
      }
    }
  }

  const exportData = data as unknown as ExportData;
  const linkCount = exportData.categories.reduce((sum, cat) => sum + cat.links.length, 0);

  return {
    data: exportData,
    preview: {
      categoryCount: exportData.categories.length,
      linkCount,
      hasUI: !!exportData.ui,
      hasSearchSettings: !!exportData.searchSettings,
      hasAppearance: !!exportData.appearance,
    },
  };
}

/**
 * 执行导入
 */
export async function executeImport(
  data: ExportData,
  mode: ImportMode,
  currentState: ManualNavState
): Promise<ManualNavState> {
  let newCategories: Category[];

  if (mode === "overwrite") {
    // 覆盖模式：直接使用导入的数据
    newCategories = data.categories;
  } else {
    // 合并模式：合并分类和链接
    const categoryMap = new Map<string, Category>();

    // 先添加现有分类
    for (const cat of currentState.categories) {
      categoryMap.set(cat.id, { ...cat, links: [...cat.links] });
    }

    // 合并导入的分类
    for (const importCat of data.categories) {
      const existing = categoryMap.get(importCat.id);
      if (existing) {
        // 分类已存在，合并链接（避免重复）
        const existingLinkIds = new Set(existing.links.map((l) => l.id));
        for (const link of importCat.links) {
          if (!existingLinkIds.has(link.id)) {
            existing.links.push(link);
          }
        }
      } else {
        // 新分类，检查是否有同名分类
        const sameNameCat = [...categoryMap.values()].find(
          (c) => c.name === importCat.name
        );
        if (sameNameCat) {
          // 同名分类存在，合并链接
          const existingLinkIds = new Set(sameNameCat.links.map((l) => l.id));
          for (const link of importCat.links) {
            // 生成新 ID 避免冲突
            const newLink = {
              ...link,
              id: existingLinkIds.has(link.id) ? generateId() : link.id,
            };
            if (!existingLinkIds.has(link.id)) {
              sameNameCat.links.push(newLink);
            }
          }
        } else {
          // 完全新的分类
          categoryMap.set(importCat.id, { ...importCat, links: [...importCat.links] });
        }
      }
    }

    newCategories = [...categoryMap.values()];
  }

  const newState: ManualNavState = {
    categories: newCategories,
    ui: data.ui ?? currentState.ui,
  };

  // 如果导入包含搜索设置，也更新它
  if (data.searchSettings) {
    await storage.set(SEARCH_SETTINGS_KEY, {
      ...defaultSearchSettings(),
      ...data.searchSettings,
    });
  }

  // 如果导入包含外观设置，也更新它
  if (data.appearance) {
    const mergedAppearance = {
      ...defaultAppearance(),
      ...data.appearance,
    };
    await saveAppearance(mergedAppearance);
    await setCurrentAppearance(mergedAppearance, { persist: false });
  }

  if (data.backgroundImage) {
    await setBackgroundImageDataUrl(APPEARANCE_BG_KEY, data.backgroundImage);
  }

  if (data.bookmarksUI) {
    await storage.set(BOOKMARKS_UI_KEY, data.bookmarksUI);
  }

  return newState;
}


