import { SearchBar } from "@/features/search";
import { AppShell } from "@/shared/ui/layout/AppShell";
import { ManualNavSettingsSheet } from "@/features/settings/ui/ManualNavSettingsSheet";

import { useManualNavPage } from "./useManualNavPage";
import { ManualNavPageDialogs } from "../ui/ManualNavPageDialogs";
import { ManualNavWorkspace } from "../ui/ManualNavWorkspace";

export function ManualNavPage() {
  const { workspaceProps, settingsSheetProps, dialogsProps } = useManualNavPage();

  return (
    <AppShell title="" hideHeader>
      <SearchBar />
      <ManualNavWorkspace {...workspaceProps} />
      <ManualNavSettingsSheet {...settingsSheetProps} />
      <ManualNavPageDialogs {...dialogsProps} />
    </AppShell>
  );
}
