"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import { buildFolderTree, type FolderNode } from "@/lib/folder-tree";
import type { LibraryData, LibraryDrawing, LibraryFolder } from "@/lib/types";

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

function fetchLibrary() {
  return apiFetch<LibraryData>("/api/library");
}

/** Folders + drawings, shared by the sidebar and every page beside it. */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LibraryData | null>(null);

  useEffect(() => {
    let active = true;
    fetchLibrary()
      .then((library) => {
        if (active) setData(library);
      })
      .catch((e: unknown) => toast.error(toErrorMessage(e)));
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    async (action: () => Promise<unknown>, success?: string) => {
      try {
        await action();
        if (success) toast.success(success);
        setData(await fetchLibrary());
        return true;
      } catch (e) {
        toast.error(toErrorMessage(e));
        return false;
      }
    },
    [],
  );

  const value = useMemo<LibraryContextValue>(() => {
    const folders = data?.folders ?? [];
    return {
      loaded: data !== null,
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
