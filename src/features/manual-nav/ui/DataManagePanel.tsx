import { useRef, useState } from "react";
import { AlertCircle, Download, Upload } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import { Switch } from "@/shared/ui/primitives/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/primitives/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import { toast } from "@/shared/ui/primitives/use-toast";
import {
  downloadExportData,
  executeImport,
  exportData,
  parseImportFile,
  type ExportData,
  type ImportMode,
  type ImportPreview,
} from "@/features/manual-nav/lib/exportImport";
import type { ManualNavState } from "@/shared/types/manual-nav";

export function DataManagePanel({
  state,
  onImport,
}: {
  state: ManualNavState;
  onImport: (newState: ManualNavState) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importData, setImportData] = useState<ExportData | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [importing, setImporting] = useState(false);
  const [includeBackground, setIncludeBackground] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportData(state, true, includeBackground);
      downloadExportData(data);
      toast({
        title: "导出成功",
        description: `已导出 ${data.categories.length} 个分类`,
      });
    } catch (e) {
      toast({
        title: "导出失败",
        description: e instanceof Error ? e.message : "未知错误",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      const text = await file.text();
      const { data, preview } = parseImportFile(text);
      setImportData(data);
      setImportPreview(preview);
      setImportDialogOpen(true);
    } catch (err) {
      toast({
        title: "文件解析失败",
        description: err instanceof Error ? err.message : "请检查文件格式",
        variant: "destructive",
      });
    }
  };

  const handleImportConfirm = async () => {
    if (!importData) return;

    setImporting(true);
    try {
      const newState = await executeImport(importData, importMode, state);
      onImport(newState);
      toast({
        title: "导入成功",
        description: importMode === "overwrite"
          ? `已覆盖为 ${importData.categories.length} 个分类`
          : `已合并 ${importData.categories.length} 个分类`,
      });
      setImportDialogOpen(false);
      setImportData(null);
      setImportPreview(null);
    } catch (e) {
      toast({
        title: "导入失败",
        description: e instanceof Error ? e.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const totalLinks = state.categories.reduce((sum, cat) => sum + cat.links.length, 0);

  return (
    <>
      <AccordionItem value="data" className="border-none">
        <Card className="p-0">
          <AccordionTrigger className="px-4">数据管理</AccordionTrigger>
          <AccordionContent className="px-4">
            <div className="space-y-4">
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="text-sm font-medium mb-2">当前数据</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>分类数量：{state.categories.length}</div>
                  <div>链接数量：{totalLinks}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>导出数据</Label>
                <p className="text-xs text-muted-foreground">
                  将所有分类、链接及外观设置导出为 JSON 文件，可用于备份或迁移
                </p>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-bg" className="text-xs text-muted-foreground cursor-pointer">
                    包含背景图片
                  </Label>
                  <Switch
                    id="include-bg"
                    checked={includeBackground}
                    onCheckedChange={setIncludeBackground}
                  />
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleExport}
                >
                  <Download className="mr-2 h-4 w-4" />
                  导出到文件
                </Button>
              </div>

              <div className="space-y-2">
                <Label>导入数据</Label>
                <p className="text-xs text-muted-foreground">
                  从 JSON 文件导入分类和链接
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  从文件导入
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认导入</DialogTitle>
            <DialogDescription>
              请检查导入内容并选择导入方式
            </DialogDescription>
          </DialogHeader>

          {importPreview ? (
            <div className="space-y-4">
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="text-sm font-medium mb-2">文件内容</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>分类数量：{importPreview.categoryCount}</div>
                  <div>链接数量：{importPreview.linkCount}</div>
                  {importPreview.hasUI ? <div>包含 UI 设置</div> : null}
                  {importPreview.hasSearchSettings ? <div>包含搜索设置</div> : null}
                  {importPreview.hasAppearance ? <div>包含外观设置</div> : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label>导入方式</Label>
                <Select
                  value={importMode}
                  onValueChange={(v) => setImportMode(v as ImportMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">合并（追加到现有数据）</SelectItem>
                    <SelectItem value="overwrite">覆盖（替换现有数据）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importMode === "overwrite" ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-xs text-destructive">
                    覆盖模式将删除所有现有的分类和链接，此操作不可撤销！
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
              disabled={importing}
            >
              取消
            </Button>
            <Button
              onClick={handleImportConfirm}
              disabled={importing}
            >
              {importing ? "导入中..." : "确认导入"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


