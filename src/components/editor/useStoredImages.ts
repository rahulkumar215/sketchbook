"use client";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useEffect } from "react";
import { toBinaryFile } from "./scene";
import { apiFetch } from "@/lib/client-api";
import type { StoredFile } from "@/lib/types";

const PARALLEL_DOWNLOADS = 4;

/**
 * Loads a drawing's images after the scene is on screen, a few at a time.
 * Each image is its own request (cached by the browser), so drawings with
 * many screenshots never hit Vercel's 4.5 MB response limit.
 */
export function useStoredImages(
  api: ExcalidrawImperativeAPI | null,
  drawingId: string,
  fileIds: string[],
) {
  useEffect(() => {
    if (!api || fileIds.length === 0) return;
    let cancelled = false;
    const queue = [...fileIds];

    async function worker() {
      for (let id = queue.shift(); id && !cancelled; id = queue.shift()) {
        try {
          const file = await apiFetch<StoredFile>(
            `/api/drawings/${drawingId}/files/${encodeURIComponent(id)}`,
          );
          if (!cancelled) api?.addFiles([toBinaryFile(file)]);
        } catch (error) {
          console.error(`Image ${id} failed to load`, error);
        }
      }
    }

    void Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
    return () => {
      cancelled = true;
    };
  }, [api, drawingId, fileIds]);
}
