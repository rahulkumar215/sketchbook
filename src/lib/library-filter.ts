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

export type TagCount = { tag: string; count: number };

/** Every tag with how many drawings carry it: most used first, then A-Z. */
export function tagCounts(drawings: LibraryDrawing[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const tag of drawings.flatMap((d) => d.tags)) {
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
