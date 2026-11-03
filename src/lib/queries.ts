import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import type {
  AddedShapeLibrary,
  DrawingScene,
  GalleryImage,
  LibraryData,
  UsageData,
} from "@/lib/types";

/** Every read the app makes, keyed in one place. */

/** Folders + drawing summaries + storage size: sidebar and library. */
export const libraryQuery = queryOptions({
  queryKey: ["library"],
  queryFn: () => apiFetch<LibraryData>("/api/library"),
  // The sidebar and grid have no inline error state.
  meta: { errorMessage: "Couldn't load your drawings" },
});

export const imagesQuery = queryOptions({
  queryKey: ["images"],
  queryFn: () => apiFetch<GalleryImage[]>("/api/images"),
});

export const usageQuery = queryOptions({
  queryKey: ["usage"],
  queryFn: () => apiFetch<UsageData>("/api/usage"),
});

export const shapeLibrariesQuery = queryOptions({
  queryKey: ["shape-libraries"],
  queryFn: () => apiFetch<AddedShapeLibrary[]>("/api/shape-libraries"),
});

/**
 * One drawing's scene, for the editor. Loaded once per open and never
 * refetched: Excalidraw owns the scene after load, and autosave writes it
 * back. gcTime 0 drops it on close, so the next open is always fresh.
 */
export function drawingQuery(id: string) {
  return queryOptions({
    queryKey: ["drawing", id],
    queryFn: () => apiFetch<DrawingScene>(`/api/drawings/${id}`),
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * After any drawing or folder write: the library, the image gallery (titles,
 * deletions, new images) and usage all derive from drawings. Open screens
 * refetch now; the rest refetch when next shown.
 */
export function invalidateDrawingLists(queryClient: QueryClient) {
  return Promise.all(
    [libraryQuery, imagesQuery, usageQuery].map(({ queryKey }) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}
