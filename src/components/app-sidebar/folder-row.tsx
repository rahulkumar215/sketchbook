"use client";

import { useDraggable } from "@dnd-kit/react";
import {
  ChevronRight,
  FolderInput,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFolderDrop } from "@/components/library/use-folder-drop";
import {
  selectionHref,
  useIsSelected,
} from "@/components/library/use-selection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { DragData } from "@/lib/dnd";
import type { FolderNode } from "@/lib/folder-tree";

export type FolderCommand = "add-child" | "move" | "rename" | "delete";

/** Drag the folder by its row; the provider's overlay follows the pointer. */
function useFolderDrag(node: FolderNode) {
  const data: DragData = {
    kind: "folder",
    id: node.id,
    from: node.parentId,
    label: node.name,
  };
  return useDraggable({
    id: `folder:${node.id}`,
    data,
  });
}

type Props = {
  node: FolderNode;
  depth: number;
  open: boolean;
  count: number;
  onToggle: () => void;
  onCommand: (command: FolderCommand, node: FolderNode) => void;
};

/** One folder in the tree: link, drop target, drag source, actions menu. */
export function FolderRow({
  node,
  depth,
  open,
  count,
  onToggle,
  onCommand,
}: Props) {
  const { setOpenMobile, isMobile } = useSidebar();
  const active = useIsSelected(node.id);
  const hasChildren = node.children.length > 0;
  const { ref: dragRef, isDragSource } = useFolderDrag(node);
  const { ref: dropRef, isDropTarget } = useFolderDrop({
    id: `into:${node.id}`,
    folderId: node.id,
  });
  const Icon = active || (hasChildren && open) ? FolderOpen : Folder;

  function handleClick() {
    // Clicking the open folder again collapses/expands it.
    if (hasChildren && (active || !open)) onToggle();
    setOpenMobile(false);
  }

  return (
    <SidebarMenuItem ref={dropRef}>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn(
          "[-webkit-touch-callout:none]",
          isDropTarget && "bg-sidebar-accent ring-2 ring-sidebar-ring",
          isDragSource && "opacity-50",
        )}
      >
        <Link
          ref={dragRef}
          href={selectionHref(node.id)}
          // natively draggable links cancel dnd-kit drags
          draggable={false}
          onClick={handleClick}
          // Top-level folders line up with "All drawings"; each level of
          // nesting indents by one icon width.
          style={depth > 0 ? { paddingLeft: `${8 + depth * 16}px` } : undefined}
        >
          <Icon />
          <span className="truncate">{node.name}</span>
          {hasChildren ? (
            <ChevronRight
              aria-hidden
              className={cn(
                "size-3! shrink-0 text-muted-foreground transition-transform",
                open && "rotate-90",
              )}
            />
          ) : null}
        </Link>
      </SidebarMenuButton>
      <SidebarMenuBadge className="right-7">{count}</SidebarMenuBadge>
      {/* non-modal: its items open Dialogs (see drawing-card.tsx) */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
            <span className="sr-only">Actions for {node.name}</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
          className="w-48"
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onCommand("add-child", node)}>
              <FolderPlus />
              New sub-folder
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCommand("move", node)}>
              <FolderInput />
              Move to&hellip;
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCommand("rename", node)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onCommand("delete", node)}
            >
              <Trash2 />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
