import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  Cloud,
  Code2,
  Film,
  Gamepad2,
  Globe2,
  Mail,
  MessageCircle,
  Music4,
  Palette,
  ShoppingBag,
  Sparkles,
  Terminal,
} from "lucide-react";

import type { SiteIconPresetName, SiteLinkIcon } from "@/shared/types/link";

import { extractSiteName } from "./siteName";

export const DEFAULT_SITE_ICON_COLOR = "#0F766E";
export const DEFAULT_SITE_ICON_PRESET: SiteIconPresetName = "globe";

export const SITE_ICON_COLORS = [
  { value: "#0F766E", label: "青绿" },
  { value: "#2563EB", label: "海蓝" },
  { value: "#DC2626", label: "朱红" },
  { value: "#EA580C", label: "橙" },
  { value: "#65A30D", label: "青柠" },
  { value: "#7C3AED", label: "紫" },
  { value: "#DB2777", label: "玫红" },
  { value: "#475569", label: "灰蓝" },
] as const;

type SiteIconPresetDefinition = {
  name: SiteIconPresetName;
  label: string;
  icon: LucideIcon;
};

export const SITE_ICON_PRESETS: SiteIconPresetDefinition[] = [
  { name: "globe", label: "通用", icon: Globe2 },
  { name: "sparkles", label: "灵感", icon: Sparkles },
  { name: "code", label: "开发", icon: Code2 },
  { name: "terminal", label: "终端", icon: Terminal },
  { name: "book", label: "学习", icon: BookOpen },
  { name: "briefcase", label: "工作", icon: Briefcase },
  { name: "palette", label: "设计", icon: Palette },
  { name: "message", label: "社区", icon: MessageCircle },
  { name: "shopping", label: "购物", icon: ShoppingBag },
  { name: "music", label: "音乐", icon: Music4 },
  { name: "video", label: "视频", icon: Film },
  { name: "gamepad", label: "游戏", icon: Gamepad2 },
  { name: "mail", label: "邮件", icon: Mail },
  { name: "calendar", label: "日程", icon: CalendarDays },
  { name: "cloud", label: "云端", icon: Cloud },
];

const SITE_ICON_PRESET_MAP = new Map(
  SITE_ICON_PRESETS.map((preset) => [preset.name, preset]),
);

const HEX_COLOR_PATTERN = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHexColor(color?: string): string {
  const value = color?.trim();
  if (!value || !HEX_COLOR_PATTERN.test(value)) {
    return DEFAULT_SITE_ICON_COLOR;
  }

  const prefixed = value.startsWith("#") ? value : `#${value}`;
  if (prefixed.length === 4) {
    const [hash, r, g, b] = prefixed;
    return `${hash}${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return prefixed.toUpperCase();
}

function normalizeSiteIconText(text: string): string {
  const trimmed = Array.from(text.trim()).slice(0, 2).join("");
  if (!trimmed) return "";
  return /^[a-z0-9]+$/i.test(trimmed) ? trimmed.toUpperCase() : trimmed;
}

function isAsciiAlphaNumeric(char: string): boolean {
  return /^[A-Za-z0-9]$/.test(char);
}

function isWideGlyph(char: string): boolean {
  return !isAsciiAlphaNumeric(char);
}

export function normalizeSiteUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export function getSuggestedSiteTitle(url: string): string {
  return extractSiteName(url);
}

export function isCustomSiteTitle(title: string, url: string): boolean {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return false;

  const normalizedUrl = normalizeSiteUrl(url);
  if (!normalizedUrl) return true;

  return trimmedTitle !== getSuggestedSiteTitle(normalizedUrl);
}

export function getSuggestedSiteIconText(title: string, url?: string): string {
  const source = title.trim() || (url ? getSuggestedSiteTitle(url) : "");
  const trimmed = source.trim();
  if (!trimmed) return "?";

  const tokens = trimmed.split(/[\s/_-]+/).filter(Boolean);
  const startsWithAscii = (value: string) => /^[A-Za-z0-9]/.test(value);

  if (tokens.length >= 2 && startsWithAscii(tokens[0]) && startsWithAscii(tokens[1])) {
    return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
  }

  if (tokens.length >= 1 && startsWithAscii(tokens[0])) {
    return tokens[0][0].toUpperCase();
  }

  return Array.from(trimmed).slice(0, 2).join("");
}

export function getSiteIconTextLayout(text: string): {
  fontScale: number;
  fontWeight: 600 | 700;
  letterSpacing: string;
} {
  const chars = Array.from(text.trim());
  const visibleChars = chars.length || 1;
  const hasWideGlyph = chars.some(isWideGlyph);

  if (hasWideGlyph) {
    return visibleChars >= 2
      ? { fontScale: 0.62, fontWeight: 700, letterSpacing: "-0.08em" }
      : { fontScale: 0.78, fontWeight: 700, letterSpacing: "-0.03em" };
  }

  return visibleChars >= 2
    ? { fontScale: 0.72, fontWeight: 700, letterSpacing: "-0.05em" }
    : { fontScale: 0.82, fontWeight: 700, letterSpacing: "-0.02em" };
}

export function getSiteIconPreset(name: SiteIconPresetName): SiteIconPresetDefinition | undefined {
  return SITE_ICON_PRESET_MAP.get(name);
}

export function normalizeSiteLinkIcon(icon?: SiteLinkIcon | null): SiteLinkIcon | undefined {
  if (!icon) return undefined;

  if (icon.type === "preset") {
    if (!SITE_ICON_PRESET_MAP.has(icon.name)) return undefined;
    return {
      type: "preset",
      name: icon.name,
      color: normalizeHexColor(icon.color),
    };
  }

  if (icon.type === "text") {
    const text = normalizeSiteIconText(icon.text);
    if (!text) return undefined;
    return {
      type: "text",
      text,
      color: normalizeHexColor(icon.color),
    };
  }

  return undefined;
}

export function getSiteIconForeground(color: string): string {
  const normalized = normalizeHexColor(color).slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#0F172A" : "#FFFFFF";
}

export function getSiteIconKey(icon?: SiteLinkIcon): string {
  if (!icon) return "auto";
  if (icon.type === "preset") return `preset:${icon.name}:${normalizeHexColor(icon.color)}`;
  return `text:${normalizeSiteIconText(icon.text)}:${normalizeHexColor(icon.color)}`;
}
