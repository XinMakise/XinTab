export type SiteIconPresetName =
  | "globe"
  | "sparkles"
  | "code"
  | "terminal"
  | "book"
  | "briefcase"
  | "palette"
  | "message"
  | "shopping"
  | "music"
  | "video"
  | "gamepad"
  | "mail"
  | "calendar"
  | "cloud";

export type SiteLinkIcon =
  | {
      type: "preset";
      name: SiteIconPresetName;
      color?: string;
    }
  | {
      type: "text";
      text: string;
      color?: string;
    };

export type SiteLink = {
  id: string;
  title: string;
  url: string;
  icon?: SiteLinkIcon;
};
