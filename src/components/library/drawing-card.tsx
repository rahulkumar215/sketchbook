"use client";

import { useDraggable } from "@dnd-kit/react";
import {
  ExternalLink,
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { CardTags } from "./card-tags";
import { selectionHref } from "./use-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DragData } from "@/lib/dnd";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LibraryDrawing } from "@/lib/types";

type Props = {
  drawing: LibraryDrawing;
  folderLabel: string;
  activeTags: string[];
  onEdit: () => void;
  onDelete: () => void;
  onTagClick: (tag: string) => void;
};

/**
 * The drawing's folder beside its title. `relative` lifts it above the
 * card-wide link overlay, so clicking it opens the folder instead.
 */
function FolderChip({ folderId, label }: { folderId: string; label: string }) {
  return (
    <Badge
      asChild
      variant="outline"
      className="relative max-w-1/2 min-w-0 shrink-0 font-normal"
    >
      <Link
        href={selectionHref(folderId)}
        title={`Open folder ${label}`}
        draggable={false}
      >
        <Folder data-icon="inline-start" />
        <span className="truncate">{label}</span>
      </Link>
    </Badge>
  );
}

/**
 * Makes a card draggable onto sidebar folders. The card stays put (dimmed);
 * a copy of it in the provider's DragOverlay is what follows the pointer. Keep the default
 * feedback: `feedback: "none"` also skips measuring the drag, and with no
 * drag shape dnd-kit detects no drop targets at all.
 */
function useCardDrag(drawing: LibraryDrawing) {
  const data: DragData = {
    kind: "drawing",
    id: drawing.id,
    from: drawing.folderId,
    label: drawing.title,
  };
  return useDraggable({
    id: `drawing:${drawing.id}`,
    data,
  });
}

/** A drawing in the library grid. Drag it onto a sidebar folder to move it. */
export function DrawingCard({
  drawing,
  folderLabel,
  activeTags,
  onEdit,
  onDelete,
  onTagClick,
}: Props) {
  const href = `/d/${drawing.id}`;
  const { ref: dragRef, isDragSource } = useCardDrag(drawing);
  return (
    <Card
      ref={dragRef}
      size="sm"
      className={cn(
        // no iOS link menu on the long-press that starts a touch drag
        "relative transition-colors [-webkit-touch-callout:none] hover:ring-foreground/25",
        isDragSource && "opacity-50",
      )}
    >
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          {/* the ::after overlay makes the whole card open the drawing */}
          {/* draggable={false}: a natively draggable link cancels dnd-kit */}
          <Link
            href={href}
            draggable={false}
            className="truncate after:absolute after:inset-0 after:content-['']"
          >
            {drawing.title}
          </Link>
          {folderLabel && drawing.folderId ? (
            <FolderChip folderId={drawing.folderId} label={folderLabel} />
          ) : null}
        </CardTitle>
        <CardDescription className="truncate">
          edited {timeAgo(drawing.updatedAt)}
        </CardDescription>
        <CardAction className="relative">
          {/* modal={false}: a menu item opens a Dialog. A modal menu that is
              still closing when the Dialog opens leaves
              `pointer-events: none` stuck on <body> (Radix), which froze
              every click on the page after saving. */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal />
                <span className="sr-only">Actions for {drawing.title}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href={href}>
                    <ExternalLink />
                    Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil />
                  Rename, move, tags
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      {drawing.tags.length > 0 ? (
        <CardContent className="relative">
          <CardTags
            tags={drawing.tags}
            activeTags={activeTags}
            onTagClick={onTagClick}
          />
        </CardContent>
      ) : null}
    </Card>
  );
}
