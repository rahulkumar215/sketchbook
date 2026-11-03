"use client";

import { loadLibraryFromBlob } from "@excalidraw/excalidraw";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  LibraryItem,
} from "@excalidraw/excalidraw/types";
import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { BUNDLED_LIBRARIES, libraryUrl } from "@/lib/libraries";

async function fetchLibrary(name: string): Promise<LibraryItem[]> {
  const res = await fetch(libraryUrl(name));
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  // Parses both library formats (v1 and v2) and validates the contents.
  return loadLibraryFromBlob(await res.blob(), "published");
}

/** Every bundled library's items; a broken file is skipped, not fatal. */
async function fetchAllLibraries(): Promise<LibraryItem[]> {
  const results = await Promise.allSettled(BUNDLED_LIBRARIES.map(fetchLibrary));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Bundled libraries failed to load", failed);
    toast.error(`${failed.length} shape libraries couldn't be loaded`);
  }
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

function isLibraryOpen(appState: AppState): boolean {
  const sidebar = appState.openSidebar;
  // The library is the default tab of the default sidebar.
  return (
    sidebar?.name === "default" && (sidebar.tab ?? "library") === "library"
  );
}

/**
 * Adds the bundled libraries to the Library panel the first time it opens,
 * so drawings that never use it don't download them. The files are static
 * (served by the CDN, cached by the browser), not read from the database.
 * Returns a handler to call from Excalidraw's onChange.
 */
export function useBundledLibraries(api: ExcalidrawImperativeAPI | null) {
  const loaded = useRef(false);

  return useCallback(
    (appState: AppState) => {
      if (!api || loaded.current || !isLibraryOpen(appState)) return;
      loaded.current = true;
      // A pending promise makes the panel show its own loading state.
      void api.updateLibrary({
        libraryItems: fetchAllLibraries(),
        merge: true,
        defaultStatus: "published",
      });
    },
    [api],
  );
}
