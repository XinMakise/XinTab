import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseExpandedIdSetOptions = {
  defaultExpanded?: boolean;
  expandNewIds?: boolean;
};

function hasSameMembers(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

export function useExpandedIdSet(
  ids: string[],
  { defaultExpanded = false, expandNewIds = defaultExpanded }: UseExpandedIdSetOptions = {},
) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpanded ? ids : []),
  );

  const idsKey = useMemo(() => ids.join("|"), [ids]);
  const previousIdsRef = useRef<Set<string>>(new Set(ids));

  useEffect(() => {
    const previousIds = previousIdsRef.current;
    const currentIds = new Set(ids);

    setExpandedIds((prevExpandedIds) => {
      const next = new Set<string>();

      for (const id of ids) {
        if (previousIds.has(id)) {
          if (prevExpandedIds.has(id)) {
            next.add(id);
          }
          continue;
        }

        if (expandNewIds) {
          next.add(id);
        }
      }

      if (hasSameMembers(prevExpandedIds, next)) {
        return prevExpandedIds;
      }

      return next;
    });

    previousIdsRef.current = currentIds;
  }, [expandNewIds, ids, idsKey]);

  const toggleExpandedId = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return {
    expandedIds,
    toggleExpandedId,
    setExpandedIds,
  };
}
