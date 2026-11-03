"use client";

import {
  loadLibraryFromBlob,
  parseLibraryTokensFromUrl,
} from "@excalidraw/excalidraw";
import type { LibraryItem } from "@excalidraw/excalidraw/types";
import { toast } from "sonner";
import { apiFetch } from "@/lib/client-api";
import { BUNDLED_LIBRARIES, bundledLibraryUrl } from "@/lib/shape-libraries";
import type { AddedShapeLibrary } from "@/lib/types";

/** One library file (bundled or from libraries.excalidraw.com). */
export async function fetchLibrary(url: string): Promise<LibraryItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  // Parses both library formats (v1 and v2) and validates the contents.
  return loadLibraryFromBlob(await res.blob(), "published");
}

/** Bundled libraries plus the ones added with "Browse libraries". */
async function allLibraryUrls(): Promise<string[]> {
  const bundled = BUNDLED_LIBRARIES.map(bundledLibraryUrl);
  try {
    const added = await apiFetch<AddedShapeLibrary[]>("/api/shape-libraries");
    return [...bundled, ...added.map((library) => library.url)];
  } catch (error) {
    console.error("Added shape libraries failed to load", error);
    toast.error("Your added libraries couldn't be loaded");
    return bundled;
  }
}

/** Every library's items; a file that fails is skipped, not fatal. */
export async function fetchAllLibraries(): Promise<LibraryItem[]> {
  const urls = await allLibraryUrls();
  const results = await Promise.allSettled(urls.map(fetchLibrary));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Shape libraries failed to load", failed);
    toast.error(`${failed.length} shape libraries couldn't be loaded`);
  }
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

/**
 * "Add to Excalidraw" on libraries.excalidraw.com returns here with
 * `#addLibrary=<url>&token=…`. Returns that URL and removes the hash from
 * the address bar, so a reload doesn't add the library again.
 */
export function takeLibraryUrlFromHash(): string | null {
  const tokens = parseLibraryTokensFromUrl();
  if (!tokens) return null;
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
  return tokens.libraryUrl;
}
