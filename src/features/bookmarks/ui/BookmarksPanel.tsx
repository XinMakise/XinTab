import { useState } from "react";

import { ChevronDown, ExternalLink, Trash2 } from "lucide-react";



import { Button } from "@/shared/ui/primitives/button";

import { Card } from "@/shared/ui/primitives/card";

import {

  Collapsible,

  CollapsibleContent,

  CollapsibleTrigger,

} from "@/shared/ui/primitives/collapsible";

import {

  AccordionContent,

  AccordionItem,

  AccordionTrigger,

} from "@/shared/ui/primitives/accordion";

import { toast } from "@/shared/ui/primitives/use-toast";

import { getBookmarksByFolders } from "@/features/bookmarks/lib/bookmarks";

import { removeBookmark } from "@/features/bookmarks/lib/chromeBookmarkEditor";

import { LayoutSettingsPanel } from "@/features/settings/ui/LayoutSettingsPanel";

import { hasChromeBookmarks } from "@/shared/browser/chrome";

import type { Category } from "@/shared/types/category";



export function BookmarksLayoutPanel({

  bookmarksLayout,

  onBookmarksLayoutChange,

  maxVisibleRows,

  onMaxVisibleRowsChange,

  columnsPerRow,

  onColumnsPerRowChange,

}: {

  bookmarksLayout?: "top" | "left" | "all";

  onBookmarksLayoutChange?: (layout: "top" | "left" | "all") => void;

  maxVisibleRows?: number;

  onMaxVisibleRowsChange?: (rows: number) => void;

  columnsPerRow?: number;

  onColumnsPerRowChange?: (columns: number) => void;

}) {

  return (

    <LayoutSettingsPanel

      layout={bookmarksLayout}

      onLayoutChange={onBookmarksLayoutChange}

      maxVisibleRows={maxVisibleRows}

      onMaxVisibleRowsChange={onMaxVisibleRowsChange}

      columnsPerRow={columnsPerRow}

      onColumnsPerRowChange={onColumnsPerRowChange}

    />

  );

}



export function BookmarksManagePanel() {

  const [bookmarkCategories, setBookmarkCategories] = useState<Category[]>([]);

  const [bookmarksLoading, setBookmarksLoading] = useState(false);



  const loadBookmarkCategories = async () => {

    if (!hasChromeBookmarks()) {

      toast({

        title: "无法访问 Chrome 书签",

        description: "请在 Chrome 扩展环境中使用此功能",

      });

      return;

    }

    setBookmarksLoading(true);

    try {

      const result = await getBookmarksByFolders();

      setBookmarkCategories(result);

    } catch (e) {

      toast({

        title: "加载失败",

        description: e instanceof Error ? e.message : "读取书签失败",

      });

    } finally {

      setBookmarksLoading(false);

    }

  };



  const removeBookmarkFromChrome = async (bookmarkId: string) => {

    try {

      await removeBookmark(bookmarkId);

      toast({ title: "已删除" });

      await loadBookmarkCategories();

    } catch (e) {

      toast({

        title: "删除失败",

        description: e instanceof Error ? e.message : "未知错误",

        variant: "destructive",

      });

    }

  };



  return (

    <AccordionItem value="bookmarks-management" className="border-none">

      <Card className="p-0">

        <AccordionTrigger className="px-4" onClick={loadBookmarkCategories}>

          内容管理

        </AccordionTrigger>

        <AccordionContent className="px-4">

          <p className="mb-3 text-xs text-muted-foreground">

            加载 Chrome 收藏并按分类查看、删除单个项目。

          </p>



          {bookmarksLoading ? (

            <div className="text-xs text-muted-foreground py-2">加载中...</div>

          ) : bookmarkCategories.length === 0 ? (

            <div className="text-xs text-muted-foreground py-2">暂无收藏</div>

          ) : (

            <div className="space-y-1">

              {bookmarkCategories.map((cat) => (

                <Collapsible key={cat.id}>

                  <div className="rounded-md border bg-card">

                    <CollapsibleTrigger asChild>

                      <div className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50">

                        <div className="min-w-0 flex items-center gap-2">

                          <ChevronDown className="h-3.5 w-3.5 transition-transform" />

                          <div className="truncate text-sm font-medium">{cat.name}</div>

                          {cat.links.length > 0 ? (

                            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">

                              {cat.links.length}

                            </span>

                          ) : null}

                        </div>

                      </div>

                    </CollapsibleTrigger>

                    <CollapsibleContent>

                      <div className="border-t px-3 py-2 space-y-1">

                        {cat.links.map((link) => (

                          <div

                            key={link.id}

                            className="flex items-center justify-between gap-2 rounded-sm hover:bg-accent/30 px-2 py-1.5"

                          >

                            <a

                              href={link.url}

                              target="_blank"

                              rel="noreferrer"

                              className="flex items-center gap-2 min-w-0 flex-1"

                            >

                              <span className="truncate text-xs">{link.title}</span>

                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />

                            </a>

                            <Button

                              variant="ghost"

                              size="icon"

                              aria-label="删除书签"

                              onClick={() => removeBookmarkFromChrome(link.id)}

                              className="h-6 w-6"

                            >

                              <Trash2 className="h-3 w-3" />

                            </Button>

                          </div>

                        ))}

                      </div>

                    </CollapsibleContent>

                  </div>

                </Collapsible>

              ))}

            </div>

          )}

        </AccordionContent>

      </Card>

    </AccordionItem>

  );

}

