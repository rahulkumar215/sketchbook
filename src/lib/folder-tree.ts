import type { LibraryFolder } from "@/lib/types";

export type FolderNode = LibraryFolder & { children: FolderNode[] };

/** Turns the flat folder list into a sorted tree. */
export function buildFolderTree(folders: LibraryFolder[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>();
  for (const f of folders) nodes.set(f.id, { ...f, children: [] });

  const roots: FolderNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const sortDeep = (list: FolderNode[]) => {
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.forEach((n) => sortDeep(n.children));
  };
  sortDeep(roots);
  return roots;
}

/** The folder plus every folder nested inside it, at any depth. */
export function folderAndDescendants(
  folders: LibraryFolder[],
  rootId: string,
): Set<string> {
  const ids = new Set([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const f of folders) {
      if (f.parentId && ids.has(f.parentId) && !ids.has(f.id)) {
        ids.add(f.id);
        grew = true;
      }
    }
  }
  return ids;
}

/** "Work / Clients / Acme" for a folder id. */
export function folderPath(
  folders: LibraryFolder[],
  folderId: string | null,
): string {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const parts: string[] = [];
  let current = folderId ? byId.get(folderId) : undefined;
  while (current && parts.length < 50) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts.join(" / ");
}

export type FolderChoice = {
  id: string;
  name: string;
  depth: number;
  /** "Frontend / Performance": shown once picked. */
  path: string;
};

/** Depth-first list of folders with their nesting depth, for <select>s. */
export function flattenTree(
  tree: FolderNode[],
  depth = 0,
  parentPath = "",
): FolderChoice[] {
  return tree.flatMap((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    return [
      { id: node.id, name: node.name, depth, path },
      ...flattenTree(node.children, depth + 1, path),
    ];
  });
}
