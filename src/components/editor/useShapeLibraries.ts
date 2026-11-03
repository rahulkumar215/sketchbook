"use client";

import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { toast } from "sonner";
import {
  fetchAllLibraries,
  fetchLibrary,
  takeLibraryUrlFromHash,
} from "./shape-library-loader";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import { isAllowedLibraryUrl, libraryNameFromUrl } from "@/lib/shape-libraries";

type Api = ExcalidrawImperativeAPI;

/** Tells other open Sketchbook tabs that a library was added. */
const CHANNEL = "sketchbook:shape-libraries";

function announceToOtherTabs(url: string) {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage(url);
  channel.close();
}

function mergeLibrary(api: Api, url: string, openLibraryMenu = false) {
  return api.updateLibrary({
    libraryItems: fetchLibrary(url),
    merge: true,
    openLibraryMenu,
    defaultStatus: "published",
  });
}

/** Saves the library for every drawing and shows it in this one. */
async function addLibrary(api: Api, url: string) {
  if (!isAllowedLibraryUrl(url)) {
    toast.error("Only libraries from libraries.excalidraw.com can be added");
    return;
  }
  const name = libraryNameFromUrl(url);
  try {
    await Promise.all([
      apiFetch("/api/shape-libraries", { method: "POST", json: { url } }),
      mergeLibrary(api, url, true),
    ]);
    announceToOtherTabs(url);
    toast.success(`Added "${name}" to every drawing`);
  } catch (error) {
    toast.error(`Couldn't add "${name}": ${toErrorMessage(error)}`);
  }
}

/** Handles the "Add to Excalidraw" return link, once per page load. */
function useAddLibraryFromLink(api: Api | null) {
  useEffect(() => {
    if (!api) return;
    const url = takeLibraryUrlFromHash();
    if (url) void addLibrary(api, url);
  }, [api]);
}

/** A library added in another tab shows up here too, if already loaded. */
function useLibrariesFromOtherTabs(
  api: Api | null,
  loaded: RefObject<boolean>,
) {
  useEffect(() => {
    if (!api || typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (event: MessageEvent<unknown>) => {
      const url = event.data;
      if (!loaded.current || typeof url !== "string") return;
      if (!isAllowedLibraryUrl(url)) return;
      mergeLibrary(api, url).catch((error: unknown) =>
        console.error("Library from another tab failed to load", error),
      );
    };
    return () => channel.close();
  }, [api, loaded]);
}

function isLibraryOpen(appState: AppState): boolean {
  const sidebar = appState.openSidebar;
  // The library is the default tab of the default sidebar.
  return (
    sidebar?.name === "default" && (sidebar.tab ?? "library") === "library"
  );
}

/**
 * The Library panel's contents: every library saved in `shape_libraries`,
 * loaded the first time the panel opens (drawings that never use it
 * download nothing). Returns a handler for Excalidraw's onChange.
 */
export function useShapeLibraries(api: Api | null) {
  const loaded = useRef(false);
  useAddLibraryFromLink(api);
  useLibrariesFromOtherTabs(api, loaded);

  return useCallback(
    (appState: AppState) => {
      if (!api || loaded.current || !isLibraryOpen(appState)) return;
      loaded.current = true;
      // A pending promise makes the panel show its own loading state.
      api
        .updateLibrary({
          libraryItems: fetchAllLibraries(),
          merge: true,
          defaultStatus: "published",
        })
        .catch((error: unknown) =>
          console.error("Shape libraries failed to load", error),
        );
    },
    [api],
  );
}
