import { FloatingSettingsTrigger } from "./FloatingSettingsTrigger";
import { SettingsSheet } from "./SettingsSheet";

import type { BookmarksSettingsSheetModel } from "../model/types";

export type BookmarksSettingsSheetProps = {
  model: BookmarksSettingsSheetModel;
};

export function BookmarksSettingsSheet(props: BookmarksSettingsSheetProps) {
  return <SettingsSheet {...props} trigger={<FloatingSettingsTrigger />} />;
}
