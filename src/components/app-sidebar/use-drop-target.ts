"use client";

import { useState, type DragEvent } from "react";
import { getDragItem, hasDragItem, type DragItem } from "@/lib/dnd";

/** Makes an element accept dragged drawings/folders. */
export function useDropTarget(onDrop: (item: DragItem) => void) {
  const [dropping, setDropping] = useState(false);
  return {
    dropping,
    handlers: {
      onDragOver: (e: DragEvent) => {
        if (!hasDragItem(e)) return;
        e.preventDefault();
        setDropping(true);
      },
      onDragLeave: () => setDropping(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setDropping(false);
        const item = getDragItem(e);
        if (item) onDrop(item);
      },
    },
  };
}
