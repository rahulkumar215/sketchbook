/**
 * Drag-and-drop payloads (@dnd-kit/react): drawings and folders are dragged
 * onto folders, "Unfiled" or the sidebar's "top level" zone.
 */

export type DragItem = { kind: "drawing" | "folder"; id: string };

/** What a draggable carries: the item, where it is now, a preview label. */
export type DragData = DragItem & {
  /** Current folder (drawing) or parent (folder); null = top level. */
  from: string | null;
  label: string;
};

/** What a drop target carries: the folder it moves into (null = top). */
export type DropData = { folderId: string | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function idOrNull(value: unknown): string | null | undefined {
  if (value === null || typeof value === "string") return value;
  return undefined;
}

export function asDragData(data: unknown): DragData | null {
  if (!isRecord(data)) return null;
  const { kind, id, label } = data;
  const from = idOrNull(data.from);
  if (kind !== "drawing" && kind !== "folder") return null;
  if (typeof id !== "string" || typeof label !== "string") return null;
  if (from === undefined) return null;
  return { kind, id, from, label };
}

export function asDropData(data: unknown): DropData | null {
  if (!isRecord(data)) return null;
  const folderId = idOrNull(data.folderId);
  return folderId === undefined ? null : { folderId };
}
