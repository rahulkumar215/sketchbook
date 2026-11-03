"use client";

import { FolderPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { FolderRow, type FolderCommand } from "./folder-row";
import { ConfirmDeleteDialog } from "@/components/forms/confirm-delete-dialog";
import { FolderNameDialog } from "@/components/forms/folder-name-dialog";
import { useLibraryActions } from "@/components/library/library-actions";
import { useLibrary } from "@/components/library/library-context";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import type { FolderNode } from "@/lib/folder-tree";

type DialogState =
  | { kind: "create"; parent: FolderNode | null }
  | { kind: "rename" | "delete"; folder: FolderNode }
  | null;

type Row = { node: FolderNode; depth: number };

/** Depth-first list of the folders whose parents are all expanded. */
function visibleRows(
  tree: FolderNode[],
  collapsed: Set<string>,
  depth = 0,
): Row[] {
  return tree.flatMap((node) => [
    { node, depth },
    ...(collapsed.has(node.id)
      ? []
      : visibleRows(node.children, collapsed, depth + 1)),
  ]);
}

export function NavFolders() {
  const { loaded, tree, drawings } = useLibrary();
  const actions = useLibraryActions();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of drawings) {
      if (d.folderId) map.set(d.folderId, (map.get(d.folderId) ?? 0) + 1);
    }
    return map;
  }, [drawings]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCommand(command: FolderCommand, folder: FolderNode) {
    if (command === "add-child") setDialog({ kind: "create", parent: folder });
    else setDialog({ kind: command, folder });
  }

  const close = (open: boolean) => {
    if (!open) setDialog(null);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Folders</SidebarGroupLabel>
      <SidebarGroupAction
        title="New folder"
        onClick={() => setDialog({ kind: "create", parent: null })}
      >
        <FolderPlus />
        <span className="sr-only">New folder</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {!loaded
            ? Array.from({ length: 3 }, (_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))
            : visibleRows(tree, collapsed).map(({ node, depth }) => (
                <FolderRow
                  key={node.id}
                  node={node}
                  depth={depth}
                  open={!collapsed.has(node.id)}
                  count={counts.get(node.id) ?? 0}
                  onToggle={() => toggle(node.id)}
                  onCommand={handleCommand}
                />
              ))}
        </SidebarMenu>
        {loaded && tree.length === 0 ? (
          <p className="px-2 py-1 text-xs text-muted-foreground">
            No folders yet. Create one, then drag drawings onto it.
          </p>
        ) : null}
      </SidebarGroupContent>

      <FolderNameDialog
        open={dialog?.kind === "create"}
        title={
          dialog?.kind === "create" && dialog.parent
            ? "New sub-folder"
            : "New folder"
        }
        description={
          dialog?.kind === "create" && dialog.parent
            ? `Inside “${dialog.parent.name}”.`
            : "A top-level folder."
        }
        submitLabel="Create"
        onOpenChange={close}
        onSubmit={(name) =>
          actions.createFolder(
            name,
            dialog?.kind === "create" ? (dialog.parent?.id ?? null) : null,
          )
        }
      />
      <FolderNameDialog
        open={dialog?.kind === "rename"}
        title="Rename folder"
        description="Drawings inside it are not affected."
        submitLabel="Rename"
        defaultName={dialog?.kind === "rename" ? dialog.folder.name : ""}
        onOpenChange={close}
        onSubmit={(name) =>
          dialog?.kind === "rename"
            ? actions.renameFolder(dialog.folder.id, name)
            : Promise.resolve(true)
        }
      />
      <ConfirmDeleteDialog
        open={dialog?.kind === "delete"}
        title="Delete this folder?"
        description={`“${dialog?.kind === "delete" ? dialog.folder.name : ""}” will be removed. Its drawings and sub-folders are NOT deleted; they move up one level.`}
        confirmLabel="Delete folder"
        onOpenChange={close}
        onConfirm={() => {
          if (dialog?.kind === "delete")
            void actions.deleteFolder(dialog.folder.id);
        }}
      />
    </SidebarGroup>
  );
}
