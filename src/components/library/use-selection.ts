"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ALL, type Selection } from "@/lib/library-filter";

/** The selected folder lives in the URL (?folder=…) so it survives reloads. */
export function useSelection(): Selection {
  return useSearchParams().get("folder") ?? ALL;
}

/** True when this selection is what the library page is showing now. */
export function useIsSelected(selection: Selection): boolean {
  const current = useSelection();
  return usePathname() === "/" && current === selection;
}

export function selectionHref(selection: Selection): string {
  return selection === ALL ? "/" : `/?folder=${encodeURIComponent(selection)}`;
}
