/** Drag-and-drop payloads: drawings and folders can be dropped on folders. */

export type DragItem = { kind: "drawing" | "folder"; id: string };

const MIME = "application/x-sketchbook";

export function setDragItem(e: React.DragEvent, item: DragItem) {
  e.dataTransfer.setData(MIME, JSON.stringify(item));
  e.dataTransfer.effectAllowed = "move";
}

export function hasDragItem(e: React.DragEvent): boolean {
  return e.dataTransfer.types.includes(MIME);
}

export function getDragItem(e: React.DragEvent): DragItem | null {
  try {
    const parsed: unknown = JSON.parse(e.dataTransfer.getData(MIME));
    if (
      parsed &&
      typeof parsed === "object" &&
      "kind" in parsed &&
      "id" in parsed &&
      (parsed.kind === "drawing" || parsed.kind === "folder") &&
      typeof parsed.id === "string"
    ) {
      return { kind: parsed.kind, id: parsed.id };
    }
  } catch {
    // not one of ours
  }
  return null;
}
