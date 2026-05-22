import { useCallback, useEffect, useState } from "react";

import { Card } from "@/shared/ui/primitives/card";
import { Label } from "@/shared/ui/primitives/label";
import { Slider } from "@/shared/ui/primitives/slider";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/primitives/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import {
  getCurrentAppearance,
  loadAppearance,
  saveAppearance,
  setCurrentAppearance,
  subscribeAppearance,
  type AppearanceSettings,
} from "@/features/appearance";

const COLUMNS_MIN = 3;
const COLUMNS_MAX = 8;
const COLUMNS_DEFAULT = 5;
const VISIBLE_ROWS_MIN = 1;
const VISIBLE_ROWS_MAX = 10;
const VISIBLE_ROWS_DEFAULT = 3;
const LEFT_CATEGORY_WIDTH_MIN = 120;
const LEFT_CATEGORY_WIDTH_MAX = 220;
const LEFT_CATEGORY_WIDTH_DEFAULT = 192;

type LayoutMode = "top" | "left" | "all";

function normalizeColumnsPerRow(value?: number) {
  if (!value || !Number.isFinite(value)) return COLUMNS_DEFAULT;
  return Math.min(COLUMNS_MAX, Math.max(COLUMNS_MIN, Math.round(value)));
}

function normalizeVisibleRows(value?: number) {
  if (!value || !Number.isFinite(value)) return VISIBLE_ROWS_DEFAULT;
  return Math.min(VISIBLE_ROWS_MAX, Math.max(VISIBLE_ROWS_MIN, Math.round(value)));
}

function normalizeLeftCategoryWidth(value?: number) {
  if (!value || !Number.isFinite(value)) return LEFT_CATEGORY_WIDTH_DEFAULT;
  return Math.min(LEFT_CATEGORY_WIDTH_MAX, Math.max(LEFT_CATEGORY_WIDTH_MIN, Math.round(value)));
}

function useAppearanceLayoutSettings() {
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => getCurrentAppearance());

  useEffect(() => subscribeAppearance(setAppearance), []);

  useEffect(() => {
    let cancelled = false;

    void loadAppearance()
      .then((loaded) => {
        if (cancelled) return;
        void setCurrentAppearance(loaded, { persist: false });
      })
      .catch((error) => {
        console.warn("Failed to load appearance layout settings", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: AppearanceSettings) => {
    void setCurrentAppearance(next, { persist: false });

    try {
      await saveAppearance(next);
    } catch (error) {
      console.warn("Failed to save appearance layout settings", error);
    }
  }, []);

  return { appearance, persist };
}

function LayoutSliderField({
  label,
  displayValue,
  value,
  min,
  max,
  step,
  disabled = false,
  helperText,
  onValueChange,
}: {
  label: string;
  displayValue: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  helperText?: string;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="text-xs text-muted-foreground">{displayValue}</div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(next) => onValueChange(next[0] ?? value)}
      />
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export function LayoutSettingsPanel({
  layout,
  onLayoutChange,
  maxVisibleRows,
  onMaxVisibleRowsChange,
  columnsPerRow,
  onColumnsPerRowChange,
}: {
  layout?: LayoutMode;
  onLayoutChange?: (layout: LayoutMode) => void;
  maxVisibleRows?: number;
  onMaxVisibleRowsChange?: (rows: number) => void;
  columnsPerRow?: number;
  onColumnsPerRowChange?: (columns: number) => void;
}) {
  const { appearance, persist } = useAppearanceLayoutSettings();

  if (!onLayoutChange) return null;

  const normalizedColumnsPerRow = normalizeColumnsPerRow(columnsPerRow);
  const normalizedVisibleRows = normalizeVisibleRows(maxVisibleRows);
  const normalizedLeftCategoryWidth = normalizeLeftCategoryWidth(appearance.leftCategoryWidthPx);
  const rowsDisabled = layout !== "all";
  const leftWidthDisabled = layout !== "left";

  return (
    <AccordionItem value="layout" className="border-none">
      <Card className="p-0">
        <AccordionTrigger className="px-4">布局与显示</AccordionTrigger>
        <AccordionContent className="px-4">
          <div className="space-y-4 rounded-md border bg-muted/20 p-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">页面结构</div>
              <p className="text-xs text-muted-foreground">
                先决定分类排布方式，再微调卡片密度和可见范围。
              </p>
            </div>

            <div className="space-y-2">
              <Label>布局方式</Label>
              <Select
                value={layout}
                onValueChange={(value) => onLayoutChange(value as LayoutMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择布局" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">顶部横向</SelectItem>
                  <SelectItem value="left">左侧竖向</SelectItem>
                  <SelectItem value="all">全部分类纵向</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {onColumnsPerRowChange ? (
              <LayoutSliderField
                label="每行卡片数"
                displayValue={`${normalizedColumnsPerRow} 个`}
                value={normalizedColumnsPerRow}
                min={COLUMNS_MIN}
                max={COLUMNS_MAX}
                step={1}
                onValueChange={(value) => onColumnsPerRowChange(normalizeColumnsPerRow(value))}
              />
            ) : null}

            {onMaxVisibleRowsChange ? (
              <LayoutSliderField
                label="每分类显示行数"
                displayValue={`${normalizedVisibleRows} 行`}
                value={normalizedVisibleRows}
                min={VISIBLE_ROWS_MIN}
                max={VISIBLE_ROWS_MAX}
                step={1}
                disabled={rowsDisabled}
                helperText={rowsDisabled ? "仅在全部分类纵向布局下生效。" : "超出后显示“查看更多”按钮。"}
                onValueChange={(value) => onMaxVisibleRowsChange(normalizeVisibleRows(value))}
              />
            ) : null}

            <LayoutSliderField
              label="左侧分类宽度"
              displayValue={`${normalizedLeftCategoryWidth}px`}
              value={normalizedLeftCategoryWidth}
              min={LEFT_CATEGORY_WIDTH_MIN}
              max={LEFT_CATEGORY_WIDTH_MAX}
              step={4}
              disabled={leftWidthDisabled}
              helperText={leftWidthDisabled ? "切换为左侧竖向布局后生效。" : "用于控制左侧分类栏的占宽。"}
              onValueChange={(value) =>
                void persist({
                  ...appearance,
                  leftCategoryWidthPx: normalizeLeftCategoryWidth(value),
                })
              }
            />
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
