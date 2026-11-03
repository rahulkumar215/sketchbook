"use client";

import { useDroppable } from "@dnd-kit/react";
import { useLibrary } from "./library-context";
import { canDrop } from "./library-dnd";
import { asDragData, type DropData } from "@/lib/dnd";

type Options = {
  /** Unique per drop target. */
  id: string;
  /** Where a drop moves things; null = top level / Unfiled. */
  folderId: string | null;
  /** Only accept drags of this kind (default: both). */
  only?: "drawing" | "folder";
  disabled?: boolean;
};

/**
 * A drop target that moves drawings/folders into `folderId`. It refuses
 * (no highlight, no drop) anything already there, and a folder dropped
 * into itself or one of its own sub-folders.
 */
export function useFolderDrop({ id, folderId, only, disabled }: Options) {
  const { folders } = useLibrary();
  const data: DropData = { folderId };
  return useDroppable({
    id,
    data,
    disabled,
    accept: (source) => {
      const item = asDragData(source.data);
      if (!item || (only && item.kind !== only)) return false;
      return canDrop(item, folderId, folders);
    },
  });
}
