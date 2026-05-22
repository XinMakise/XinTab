import { useRef, useState } from "react";

import { normalizeSiteUrl } from "@/entities/link";
import { extractSiteName } from "@/entities/link";
import type { SiteLink } from "@/shared/types/link";

type UseQuickEditInlineAddStateOptions = {
  categoryId: string;
  onAdd: (categoryId: string, link: SiteLink) => void;
};

export function useQuickEditInlineAddState({
  categoryId,
  onAdd,
}: UseQuickEditInlineAddStateOptions) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const url = normalizeSiteUrl(value);
    if (!url) return;

    onAdd(categoryId, {
      id: crypto.randomUUID(),
      title: extractSiteName(url),
      url,
    });
    setValue("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return {
    value,
    inputRef,
    setValue,
    submit,
  };
}


