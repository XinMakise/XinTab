import type { SiteLink } from "./link";

export type Category = {
  id: string;
  name: string;
  links: SiteLink[];
};
