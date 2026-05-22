import { SiteIcon } from "@/shared/ui/links/SiteIcon";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import {
  DEFAULT_SITE_ICON_COLOR,
  DEFAULT_SITE_ICON_PRESET,
  getSuggestedSiteIconText,
  normalizeSiteLinkIcon,
  SITE_ICON_COLORS,
  SITE_ICON_PRESETS,
} from "@/entities/link";
import { cn } from "@/shared/lib/cn";
import type { SiteLinkIcon } from "@/shared/types/link";

type IconMode = "auto" | "preset" | "text";

function getIconMode(icon?: SiteLinkIcon): IconMode {
  if (!icon) return "auto";
  return icon.type;
}

export function SiteLinkIconEditor({
  value,
  title,
  url,
  onChange,
}: {
  value?: SiteLinkIcon;
  title: string;
  url: string;
  onChange: (icon?: SiteLinkIcon) => void;
}) {
  const normalizedValue = normalizeSiteLinkIcon(value);
  const mode = getIconMode(value);
  const previewTitle = title.trim() || "网站";
  const previewUrl = url || "https://example.com";
  const suggestedText = getSuggestedSiteIconText(previewTitle, url);
  const activeColor = normalizedValue?.color ?? DEFAULT_SITE_ICON_COLOR;

  const switchMode = (nextMode: IconMode) => {
    if (nextMode === "auto") {
      onChange(undefined);
      return;
    }

    if (nextMode === "preset") {
      onChange({
        type: "preset",
        name: normalizedValue?.type === "preset" ? normalizedValue.name : DEFAULT_SITE_ICON_PRESET,
        color: activeColor,
      });
      return;
    }

    onChange({
      type: "text",
      text: normalizedValue?.type === "text" ? normalizedValue.text : suggestedText,
      color: activeColor,
    });
  };

  const updateColor = (color: string) => {
    if (mode === "preset") {
      onChange({
        type: "preset",
        name: value?.type === "preset" ? value.name : DEFAULT_SITE_ICON_PRESET,
        color,
      });
      return;
    }

    if (mode === "text") {
      onChange({
        type: "text",
        text: value?.type === "text" ? value.text : suggestedText,
        color,
      });
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <Label>图标</Label>
        <SiteIcon
          url={previewUrl}
          title={previewTitle}
          icon={normalizedValue}
          className="h-10 w-10 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "auto", label: "自动" },
          { value: "preset", label: "Lucide" },
          { value: "text", label: "文字" },
        ].map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={mode === option.value ? "default" : "outline"}
            className="h-8"
            onClick={() => switchMode(option.value as IconMode)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {mode === "preset" && (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">图标库</div>
          <div className="grid grid-cols-5 gap-2">
            {SITE_ICON_PRESETS.map((preset) => {
              const PresetIcon = preset.icon;
              const selected = normalizedValue?.type === "preset" && normalizedValue.name === preset.name;

              return (
                <button
                  key={preset.name}
                  type="button"
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[11px] transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-input bg-background hover:bg-accent",
                  )}
                  onClick={() =>
                    onChange({
                      type: "preset",
                      name: preset.name,
                      color: activeColor,
                    })
                  }
                >
                  <PresetIcon className="h-4 w-4" />
                  <span className="leading-none">{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mode === "text" && (
        <div className="space-y-2">
          <Label htmlFor="site-icon-text">文字</Label>
          <Input
            id="site-icon-text"
            maxLength={2}
            placeholder={suggestedText}
            value={value?.type === "text" ? value.text : ""}
            onChange={(event) =>
              onChange({
                type: "text",
                text: Array.from(event.target.value).slice(0, 2).join(""),
                color: activeColor,
              })
            }
          />
        </div>
      )}

      {mode !== "auto" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="site-icon-color">颜色</Label>
            <input
              id="site-icon-color"
              type="color"
              value={activeColor}
              onChange={(event) => updateColor(event.target.value)}
              className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SITE_ICON_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                title={color.label}
                aria-label={`选择${color.label}`}
                className={cn(
                  "h-6 w-6 rounded-full border transition-transform",
                  activeColor === color.value ? "scale-110 border-foreground" : "border-background",
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => updateColor(color.value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



