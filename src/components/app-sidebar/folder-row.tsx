"use client";

import {
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDropTarget } from "./use-drop-target";
import { useLibraryActions } from "@/components/library/library-actions";
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
import { setDragItem } from "@/lib/dnd";
import type { FolderNode } from "@/lib/folder-tree";

export type FolderCommand = "add-child" | "rename" | "delete";

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
  const { moveItem } = useLibraryActions();
  const { setOpenMobile, isMobile } = useSidebar();
  const active = useIsSelected(node.id);
  const hasChildren = node.children.length > 0;
  const drop = useDropTarget((item) => {
    if (item.id !== node.id) void moveItem(item, node.id);
  });
  const Icon = active ? FolderOpen : Folder;

  function handleClick() {
    // Clicking the open folder again collapses/expands it.
    if (hasChildren && (active || !open)) onToggle();
    setOpenMobile(false);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn(drop.dropping && "ring-2 ring-sidebar-ring")}
      >
        <Link
          href={selectionHref(node.id)}
          draggable
          onDragStart={(e) => setDragItem(e, { kind: "folder", id: node.id })}
          onClick={handleClick}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          {...drop.handlers}
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "transition-transform",
              open && "rotate-90",
              !hasChildren && "invisible",
            )}
          />
          <Icon />
          <span>{node.name}</span>
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
        >
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => onCommand("add-child", node)}>
              <FolderPlus />
              New sub-folder
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
