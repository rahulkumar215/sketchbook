"use client";

import { FolderSearch, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DrawingCard } from "./drawing-card";
import { EditDrawingDialog } from "./edit-drawing-dialog";
import { useLibraryActions } from "./library-actions";
import { useLibrary } from "./library-context";
import { useSelection } from "./use-selection";
import { ConfirmDeleteDialog } from "@/components/forms/confirm-delete-dialog";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { flattenTree, folderPath } from "@/lib/folder-tree";
import { ALL, allTags, filterDrawings, UNFILED } from "@/lib/library-filter";
import type { LibraryDrawing } from "@/lib/types";

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3";

function useHeading(selection: string): string {
  const { folders } = useLibrary();
  if (selection === ALL) return "All drawings";
  if (selection === UNFILED) return "Unfiled";
  return folders.find((f) => f.id === selection)?.name ?? "Folder";
}

function LoadingGrid() {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading drawings">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

function NoResults({ filtered }: { filtered: boolean }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderSearch />
        </EmptyMedia>
        <EmptyTitle>No drawings here</EmptyTitle>
        <EmptyDescription>
          {filtered
            ? "Nothing matches your search or tags."
            : "Create one with “New drawing”, or drag drawings onto this folder."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function LibraryPage() {
  const { loaded, folders, drawings, tree } = useLibrary();
  const actions = useLibraryActions();
  const selection = useSelection();
  const heading = useHeading(selection);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [editing, setEditing] = useState<LibraryDrawing | null>(null);
  const [deleting, setDeleting] = useState<LibraryDrawing | null>(null);

  const tagList = useMemo(() => allTags(drawings), [drawings]);
  const visible = filterDrawings({
    drawings,
    folders,
    selection,
    search,
    tags,
  });
  const folderId =
    selection === ALL || selection === UNFILED ? null : selection;
  const toggleTag = (tag: string) =>
    setTags((t) =>
      t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag],
    );

  return (
    <>
      <PageHeader
        title={heading}
        description={
          loaded
            ? `${visible.length} of ${drawings.length} drawings`
            : undefined
        }
        actions={
          <Button onClick={() => void actions.createDrawing(folderId)}>
            <Plus data-icon="inline-start" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New drawing</span>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${drawings.length} drawings by title or tag`}
            aria-label="Search drawings"
          />
        </InputGroup>
        {tagList.length > 0 ? (
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            spacing={1}
            value={tags}
            onValueChange={setTags}
            aria-label="Filter by tag"
            className="flex-wrap justify-start"
          >
            {tagList.map((tag) => (
              <ToggleGroupItem key={tag} value={tag}>
                #{tag}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        ) : null}

        {!loaded ? <LoadingGrid /> : null}
        {loaded && visible.length === 0 ? (
          <NoResults filtered={Boolean(search || tags.length)} />
        ) : null}
        {loaded && visible.length > 0 ? (
          <div className={GRID}>
            {visible.map((d) => (
              <DrawingCard
                key={d.id}
                drawing={d}
                folderLabel={
                  selection === ALL ? folderPath(folders, d.folderId) : ""
                }
                activeTags={tags}
                onEdit={() => setEditing(d)}
                onDelete={() => setDeleting(d)}
                onTagClick={toggleTag}
              />
            ))}
          </div>
        ) : null}
      </div>

      <EditDrawingDialog
        drawing={editing}
        folderOptions={flattenTree(tree)}
        tagSuggestions={tagList}
        onSave={actions.saveDrawing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <ConfirmDeleteDialog
        open={deleting !== null}
        title="Delete this drawing?"
        description={`“${deleting?.title ?? ""}” and its images will be permanently deleted. This can’t be undone.`}
        confirmLabel="Delete drawing"
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => {
          if (deleting) void actions.deleteDrawing(deleting.id);
        }}
      />
    </>
  );
}
