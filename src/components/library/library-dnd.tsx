"use client";

import { PointerActivationConstraints } from "@dnd-kit/dom";
import {
  DragDropProvider,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
} from "@dnd-kit/react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLibraryActions } from "./library-actions";
import { useLibrary } from "./library-context";
import { asDragData, asDropData, type DragData } from "@/lib/dnd";
import { folderAndDescendants } from "@/lib/folder-tree";
import type { LibraryFolder } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Pointer only. Touch needs a 250 ms press so swipes still scroll; a mouse
 * drags after 6 px so clicks stay clicks. No keyboard sensor: it starts a
 * drag on Enter, which would hijack every link. Keyboard and phone users
 * move things with the "Move to" / "Rename, move, tags" dialogs.
 */
const SENSORS = [
  PointerSensor.configure({
    activationConstraints(event) {
      if (event.pointerType === "touch") {
        return [
          new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 }),
        ];
      }
      return [new PointerActivationConstraints.Distance({ value: 6 })];
    },
    preventActivation: pressedAControl,
  }),
];

/** Controls that keep their own press; links are deliberately absent. */
const CONTROLS =
  "button, input, select, textarea, [contenteditable]:not([contenteditable='false'])";

/**
 * dnd-kit's default refuses to start a drag on any link inside the
 * draggable. A card is one big link (its title's ::after overlay covers the
 * card), so that refused every card drag. Links may start drags; buttons
 * (the ⋯ menu, tags) and inputs still may not.
 */
function pressedAControl(
  event: PointerEvent,
  source: { element?: Element },
): boolean {
  const { target } = event;
  if (!(target instanceof Element)) return false;
  const control = target.closest(CONTROLS);
  return control !== null && control !== source.element;
}

/** True if dropping `item` into `folderId` would change something valid. */
export function canDrop(
  item: DragData,
  folderId: string | null,
  folders: LibraryFolder[],
): boolean {
  if (item.from === folderId) return false;
  if (item.kind === "drawing" || folderId === null) return true;
  return !folderAndDescendants(folders, item.id).has(folderId);
}

/**
 * The click that ends a drag (a press-and-release on a link, or a drop
 * onto a folder link) must not also open that link. Blocks clicks for the
 * whole drag and for the rest of the event loop turn after it ends.
 */
const blockClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
const holdClicks = () => window.addEventListener("click", blockClick, true);
const releaseClicks = () =>
  setTimeout(() => window.removeEventListener("click", blockClick, true), 0);

/** Lift styling per kind: a card brings its own surface, a row does not. */
const PREVIEW_CLASS: Record<DragData["kind"], string> = {
  drawing: "shadow-lg",
  folder:
    "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg ring-1 ring-sidebar-border",
};

/**
 * What follows the pointer: a copy of the grabbed card or folder row.
 * dnd-kit sizes the overlay to the grabbed element and keeps the grab
 * offset, so an exact copy sits right where it was picked up. Copying the
 * DOM (rather than re-rendering a look-alike) keeps it identical to the
 * real thing: active tags, folder chip, indent, all of it.
 */
function DragPreview({
  element,
  kind,
}: {
  element: Element;
  kind: DragData["kind"];
}) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const target = host.current;
    if (!target) return;
    const copy = element.cloneNode(true);
    // The original dims itself while it is the drag source; the copy must not.
    if (copy instanceof HTMLElement) copy.classList.remove("opacity-50");
    target.replaceChildren(copy);
    return () => target.replaceChildren();
  }, [element]);
  return (
    <div
      ref={host}
      inert
      aria-hidden
      className={cn("size-full *:size-full", PREVIEW_CLASS[kind])}
    />
  );
}

/** Drag drawings and folders between folders, across sidebar and grid. */
export function LibraryDndProvider({ children }: { children: ReactNode }) {
  const { folders } = useLibrary();
  const { moveItem } = useLibraryActions();

  function handleDragEnd(event: DragEndEvent) {
    releaseClicks();
    if (event.canceled) return;
    const item = asDragData(event.operation.source?.data);
    const drop = asDropData(event.operation.target?.data);
    if (!item || !drop || !canDrop(item, drop.folderId, folders)) return;
    void moveItem({ kind: item.kind, id: item.id }, drop.folderId);
  }

  return (
    <DragDropProvider
      sensors={SENSORS}
      onDragStart={holdClicks}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {(source) => {
          const item = asDragData(source.data);
          if (!item || !source.element) return null;
          return <DragPreview element={source.element} kind={item.kind} />;
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}
