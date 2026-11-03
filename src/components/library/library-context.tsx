"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { toErrorMessage } from "@/lib/client-api";
import { buildFolderTree, type FolderNode } from "@/lib/folder-tree";
import { invalidateDrawingLists, libraryQuery } from "@/lib/queries";
import type { LibraryDrawing, LibraryFolder } from "@/lib/types";

type LibraryContextValue = {
  loaded: boolean;
  folders: LibraryFolder[];
  drawings: LibraryDrawing[];
  tree: FolderNode[];
  storageBytes: number;
  /** Runs a write, toasts the outcome, then reloads the library. */
  run: (action: () => Promise<unknown>, success?: string) => Promise<boolean>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

/** Folders + drawings, shared by the sidebar and every page beside it. */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data } = useQuery(libraryQuery);

  const run = useCallback(
    async (action: () => Promise<unknown>, success?: string) => {
      try {
        await action();
        if (success) toast.success(success);
        await invalidateDrawingLists(queryClient);
        return true;
      } catch (e) {
        toast.error(toErrorMessage(e));
        return false;
      }
    },
    [queryClient],
  );

  const value = useMemo<LibraryContextValue>(() => {
    const folders = data?.folders ?? [];
    return {
      loaded: data !== undefined,
      folders,
      drawings: data?.drawings ?? [],
      tree: buildFolderTree(folders),
      storageBytes: data?.storageBytes ?? 0,
      run,
    };
  }, [data, run]);

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
}
