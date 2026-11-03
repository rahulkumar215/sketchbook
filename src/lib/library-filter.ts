import { folderAndDescendants } from "@/lib/folder-tree";
import type { LibraryDrawing, LibraryFolder } from "@/lib/types";

/** "all" | "unfiled" | a folder id */
export type Selection = string;
export const ALL = "all";
export const UNFILED = "unfiled";

type FilterInput = {
  drawings: LibraryDrawing[];
  folders: LibraryFolder[];
  selection: Selection;
  search: string;
  tags: string[];
};

function inSelection(
  d: LibraryDrawing,
  selection: Selection,
  scope: Set<string> | null,
) {
  if (selection === ALL) return true;
  if (selection === UNFILED) return d.folderId === null;
  return d.folderId !== null && scope !== null && scope.has(d.folderId);
}

/**
 * Drawings to show: those in the selected folder (including its sub-folders),
 * whose title or tags match the search, carrying every selected tag.
 */
export function filterDrawings(input: FilterInput): LibraryDrawing[] {
  const { drawings, folders, selection, tags } = input;
  const scope =
    selection === ALL || selection === UNFILED
      ? null
      : folderAndDescendants(folders, selection);
  const query = input.search.trim().toLowerCase();

  return drawings.filter((d) => {
    if (!inSelection(d, selection, scope)) return false;
    if (!tags.every((t) => d.tags.includes(t))) return false;
    if (!query) return true;
    return (
      d.title.toLowerCase().includes(query) ||
      d.tags.some((t) => t.includes(query))
    );
  });
}

export function allTags(drawings: LibraryDrawing[]): string[] {
  return [...new Set(drawings.flatMap((d) => d.tags))].sort();
}
