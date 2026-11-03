"use client";

import { pointerIntersection } from "@dnd-kit/collision";
import { useDragOperation, useDroppable } from "@dnd-kit/react";
import { useLibrary } from "./library-context";
import { canDrop, canReach } from "./library-dnd";
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
 * A drop target that moves drawings/folders into `folderId`.
 * `isOver`: the pointer is on it (drives expand-on-hover).
 * `isDropTarget`: on it AND dropping would move something (drives the
 * highlight). The folder an item is already in is "over" but not a drop
 * target; a folder's own sub-tree is neither.
 */
export function useFolderDrop({ id, folderId, only, disabled }: Options) {
  const { folders } = useLibrary();
  const { source } = useDragOperation();
  const data: DropData = { folderId };
  const { ref, isDropTarget: isOver } = useDroppable({
    id,
    data,
    disabled,
    // Only the folder under the pointer. The default also counts any target
    // the dragged card's rectangle overlaps, and a 460px card overlaps
    // several rows: a drop beside the folders still landed in one.
    collisionDetector: pointerIntersection,
    accept: (dragged) => {
      const item = asDragData(dragged.data);
      if (!item || (only && item.kind !== only)) return false;
      return canReach(item, folderId, folders);
    },
  });
  const item = asDragData(source?.data);
  const movesHere = item !== null && canDrop(item, folderId, folders);
  return { ref, isOver, isDropTarget: isOver && movesHere };
}
