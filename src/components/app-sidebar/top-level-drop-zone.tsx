"use client";

import { useDragOperation } from "@dnd-kit/react";
import { ArrowUpToLine } from "lucide-react";
import { useFolderDrop } from "@/components/library/use-folder-drop";
import { asDragData } from "@/lib/dnd";
import { cn } from "@/lib/utils";

function Zone() {
  const { ref: dropRef, isDropTarget } = useFolderDrop({
    id: "top-level",
    folderId: null,
    only: "folder",
  });
  return (
    <div
      ref={dropRef}
      className={cn(
        "mt-1 flex items-center gap-2 border border-dashed px-2 py-2 text-xs text-muted-foreground transition-colors",
        isDropTarget &&
          "border-sidebar-ring bg-sidebar-accent text-sidebar-accent-foreground",
      )}
    >
      <ArrowUpToLine className="size-4 shrink-0" />
      Drop here to move to the top level
    </div>
  );
}

/**
 * Appears below the folders only while a sub-folder is being dragged: the
 * one place to drop it to take it out of its parent. Below the list, so
 * showing it never shifts the rows being aimed at.
 */
export function TopLevelDropZone() {
  const { source } = useDragOperation();
  const item = asDragData(source?.data);
  if (item?.kind !== "folder" || item.from === null) return null;
  return <Zone />;
}
