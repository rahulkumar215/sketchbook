"use client";

import { hashElementsVersion } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { compressImage } from "./compress-image";
import {
  liveElements,
  pickAppState,
  referencedFileIds,
  settingsKey,
} from "./scene";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import { invalidateDrawingLists } from "@/lib/queries";

export type SaveStatus = "saved" | "pending" | "saving" | "error";

type Snapshot = {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
  fingerprint: string;
};

const DEBOUNCE_MS = 1500;

async function uploadImage(drawingId: string, file: BinaryFileData) {
  const encoded = await compressImage(file.dataURL, file.mimeType);
  await apiFetch(`/api/drawings/${drawingId}/files`, {
    method: "PUT",
    json: { id: file.id, ...encoded },
  });
}

/**
 * Saves the drawing ~1.5 s after the last edit. New images upload first (one
 * request each), then the scene; images no longer in the scene are pruned
 * server-side. A failed save is retried on the next edit or via `flush`.
 */
export function useAutosave(drawingId: string, initialFileIds: string[]) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<Snapshot | null>(null);
  const lastFingerprint = useRef<string | null>(null);
  const uploaded = useRef(new Set(initialFileIds));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlight = useRef<Promise<void> | null>(null);

  const save = useCallback(
    async (snap: Snapshot) => {
      setStatus("saving");
      try {
        const elements = liveElements(snap.elements);
        const fileIds = referencedFileIds(elements);
        for (const id of fileIds) {
          const file = snap.files[id];
          if (uploaded.current.has(id) || !file) continue;
          await uploadImage(drawingId, file);
          uploaded.current.add(id);
        }
        await apiFetch(`/api/drawings/${drawingId}`, {
          method: "PATCH",
          json: {
            elements,
            appState: pickAppState(snap.appState),
            fileIds: [...fileIds],
          },
        });
        // The server pruned unreferenced images; forget them so an undo
        // that brings one back re-uploads it.
        uploaded.current = new Set(
          [...uploaded.current].filter((id) => fileIds.has(id)),
        );
        lastFingerprint.current = snap.fingerprint;
        // The library's "edited" time, order and images are now out of
        // date. Nothing is fetched here: those screens refetch when shown.
        void invalidateDrawingLists(queryClient);
        setError(null);
        setStatus(pending.current ? "pending" : "saved");
      } catch (e) {
        pending.current ??= snap;
        setError(toErrorMessage(e));
        setStatus("error");
      }
    },
    [drawingId, queryClient],
  );

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (inFlight.current) await inFlight.current;
    const snap = pending.current;
    if (!snap) return;
    pending.current = null;
    inFlight.current = save(snap);
    await inFlight.current;
    inFlight.current = null;
  }, [save]);

  const onChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const fingerprint = `${hashElementsVersion(elements)}|${settingsKey(appState)}`;
      // Excalidraw calls onChange once when the scene loads: that's the
      // baseline, not an edit. Pointer moves etc. don't change the print.
      if (lastFingerprint.current === null) {
        lastFingerprint.current = fingerprint;
        return;
      }
      if (fingerprint === lastFingerprint.current && !pending.current) return;
      pending.current = { elements, appState, files, fingerprint };
      setStatus("pending");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    const unsaved = (e: BeforeUnloadEvent) => {
      if (pending.current || inFlight.current) e.preventDefault();
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    window.addEventListener("beforeunload", unsaved);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("beforeunload", unsaved);
      document.removeEventListener("visibilitychange", hidden);
      void flush(); // leaving the page in-app: save what's left
    };
  }, [flush]);

  return { status, error, onChange, flush };
}
