import { BookmarksSettingsSheet } from "@/features/settings/ui/BookmarksSettingsSheet";
import { AppShell } from "@/shared/ui/layout/AppShell";

import { useBookmarksPage } from "./useBookmarksPage";
import { BookmarksPageDialogs } from "../ui/BookmarksPageDialogs";
import { BookmarksWorkspace } from "../ui/BookmarksWorkspace";

export function BookmarksPage() {
  const { workspaceProps, settingsSheetProps, dialogsProps } = useBookmarksPage();

  return (
    <AppShell
      title="收藏页"
      description="按 Chrome 书签文件夹自动生成分类。仅在扩展环境（chrome.bookmarks 可用）下生效。"
    >
      <BookmarksWorkspace {...workspaceProps} />
      <BookmarksSettingsSheet {...settingsSheetProps} />
      <BookmarksPageDialogs {...dialogsProps} />
    </AppShell>
  );
}
