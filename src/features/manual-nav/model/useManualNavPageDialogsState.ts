import { useState } from "react";
import type { ComponentProps } from "react";

import type { SiteLink } from "@/shared/types/link";

import { ManualNavPageDialogs } from "../ui/ManualNavPageDialogs";

type EditingLinkState = { categoryId: string; link: SiteLink } | null;

type UseManualNavPageDialogsStateOptions = {
  onSaveLink: (categoryId: string, updatedLink: SiteLink) => void;
};

export function useManualNavPageDialogsState({
  onSaveLink,
}: UseManualNavPageDialogsStateOptions): {
  setEditingLink: React.Dispatch<React.SetStateAction<EditingLinkState>>;
  dialogsProps: ComponentProps<typeof ManualNavPageDialogs>;
} {
  const [editingLink, setEditingLink] = useState<EditingLinkState>(null);

  return {
    setEditingLink,
    dialogsProps: {
      editingLink,
      onEditingLinkChange: setEditingLink,
      onSaveLink,
    },
  };
}

