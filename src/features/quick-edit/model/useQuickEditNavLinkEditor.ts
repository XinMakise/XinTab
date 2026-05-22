import { useRef, useState } from "react";

import type { SiteLink } from "@/shared/types/link";

type UseQuickEditNavLinkEditorOptions = {
  link: SiteLink;
  categoryId: string;
  onUpdateTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
};

export function useQuickEditNavLinkEditor({
  link,
  categoryId,
  onUpdateTitle,
}: UseQuickEditNavLinkEditorOptions) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(link.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitEdit = () => {
    const nextTitle = editValue.trim();
    if (nextTitle && nextTitle !== link.title && onUpdateTitle) {
      onUpdateTitle(link.id, categoryId, nextTitle);
    }
    setEditing(false);
  };

  const startEdit = () => {
    setEditValue(link.title);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const cancelEdit = () => {
    setEditValue(link.title);
    setEditing(false);
  };

  return {
    editing,
    editValue,
    inputRef,
    setEditValue,
    submitEdit,
    startEdit,
    cancelEdit,
  };
}

