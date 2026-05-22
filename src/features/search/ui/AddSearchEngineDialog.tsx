import { useState } from "react";

import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import type { SearchEngine } from "@/shared/types/search";

interface Props {
  trigger: React.ReactNode;
  onAdd: (engine: SearchEngine) => void;
}

export function AddSearchEngineDialog({ trigger, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [urlTemplate, setUrlTemplate] = useState("");

  const isValid = name.trim() && urlTemplate.includes("{query}");

  const handleAdd = () => {
    if (!isValid) return;

    onAdd({
      id: `custom_${crypto.randomUUID()}`,
      name: name.trim(),
      urlTemplate: urlTemplate.trim(),
      isPreset: false,
    });
    setName("");
    setUrlTemplate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加搜索引擎</DialogTitle>
          <DialogDescription>
            添加自定义搜索引擎，URL 中使用 {"{query}"} 作为搜索词占位符
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="engine-name">名称</Label>
            <Input
              id="engine-name"
              placeholder="例如：GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="engine-url">搜索 URL</Label>
            <Input
              id="engine-url"
              placeholder="例如：https://github.com/search?q={query}"
              value={urlTemplate}
              onChange={(e) => setUrlTemplate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              使用 {"{query}"} 表示搜索词的位置
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


