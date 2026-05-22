import type { SiteLink } from "@/shared/types/link";

import { EditLinkDialog } from "./EditLinkDialog";

type ManualNavPageDialogsProps = {
  editingLink: { categoryId: string; link: SiteLink } | null;
  onEditingLinkChange: (value: { categoryId: string; link: SiteLink } | null) => void;
  onSaveLink: (categoryId: string, updatedLink: SiteLink) => void;
};

export function ManualNavPageDialogs({
  editingLink,
  onEditingLinkChange,
  onSaveLink,
}: ManualNavPageDialogsProps) {
  if (!editingLink) return null;

  return (
    <EditLinkDialog
      link={editingLink.link}
      open={!!editingLink}
      onOpenChange={(open) => !open && onEditingLinkChange(null)}
      onSave={(updatedLink) => {
        onSaveLink(editingLink.categoryId, updatedLink);
        onEditingLinkChange(null);
      }}
    />
  );
}

