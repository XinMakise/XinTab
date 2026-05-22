import { FloatingSettingsTrigger } from "./FloatingSettingsTrigger";
import { SettingsSheet } from "./SettingsSheet";

import type { ManualSettingsSheetModel } from "../model/types";

export type ManualNavSettingsSheetProps = {
  model: ManualSettingsSheetModel;
};

export function ManualNavSettingsSheet(props: ManualNavSettingsSheetProps) {
  return <SettingsSheet {...props} trigger={<FloatingSettingsTrigger />} />;
}
