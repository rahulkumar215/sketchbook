"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLibrary } from "./library-context";
import { apiFetch } from "@/lib/client-api";
import type { DragItem } from "@/lib/dnd";
import type { DrawingDetails } from "@/lib/validators";

const json = (method: string, body?: unknown) => ({ method, json: body });

/** Every write the library can make, as named handlers. */
export function useLibraryActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { run } = useLibrary();

  return {
    createDrawing: (folderId: string | null) =>
      run(async () => {
        const { id } = await apiFetch<{ id: string }>(
          "/api/drawings",
          json("POST", { folderId }),
        );
        router.push(`/d/${id}`);
      }),
    moveItem: (item: DragItem, folderId: string | null) =>
      item.kind === "drawing"
        ? run(
            () =>
              apiFetch(`/api/drawings/${item.id}`, json("PATCH", { folderId })),
            "Drawing moved",
          )
        : run(
            () =>
              apiFetch(
                `/api/folders/${item.id}`,
                json("PATCH", { parentId: folderId }),
              ),
            "Folder moved",
          ),
    createFolder: (name: string, parentId: string | null) =>
      run(
        () => apiFetch("/api/folders", json("POST", { name, parentId })),
        "Folder created",
      ),
    renameFolder: (id: string, name: string) =>
      run(
        () => apiFetch(`/api/folders/${id}`, json("PATCH", { name })),
        "Renamed",
      ),
    deleteFolder: (id: string) =>
      run(
        () => apiFetch(`/api/folders/${id}`, json("DELETE")),
        "Folder deleted",
      ),
    saveDrawing: (id: string, details: DrawingDetails) =>
      run(
        () => apiFetch(`/api/drawings/${id}`, json("PATCH", details)),
        "Saved",
      ),
    deleteDrawing: (id: string) =>
      run(
        () => apiFetch(`/api/drawings/${id}`, json("DELETE")),
        "Drawing deleted",
      ),
    logout: async () => {
      await apiFetch("/api/logout", json("POST"));
      queryClient.clear();
      router.replace("/login");
    },
  };
}
