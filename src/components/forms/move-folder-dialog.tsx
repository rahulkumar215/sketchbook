"use client";

import { ArrowUpToLine } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ChoiceLabel,
  FolderChoiceItems,
  folderChoiceLabel,
} from "@/components/library/folder-choices";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  buildFolderTree,
  flattenTree,
  folderAndDescendants,
  type FolderNode,
} from "@/lib/folder-tree";
import type { LibraryFolder } from "@/lib/types";

/** Radix Select can't hold "" as a value, so "top level" gets a sentinel. */
const TOP_LEVEL = "__top__";
const TOP_LEVEL_LABEL = { icon: ArrowUpToLine, text: "Top level" };

type Props = {
  folder: FolderNode | null;
  folders: LibraryFolder[];
  /** Resolve true to close the dialog. */
  onMove: (folderId: string, parentId: string | null) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};

/**
 * Move a folder (and everything in it) to the top level or into another
 * folder: the touch- and keyboard-friendly twin of dragging it.
 */
export function MoveFolderDialog(props: Props) {
  return (
    <Dialog open={props.folder !== null} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Move folder</DialogTitle>
          <DialogDescription>
            Moves &ldquo;{props.folder?.name}&rdquo; with everything inside it.
          </DialogDescription>
        </DialogHeader>
        {props.folder ? <MoveForm {...props} folder={props.folder} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function MoveForm({
  folder,
  folders,
  onMove,
  onOpenChange,
}: Props & { folder: FolderNode }) {
  const [target, setTarget] = useState(folder.parentId ?? TOP_LEVEL);
  const [saving, setSaving] = useState(false);
  // A folder can't go inside itself or its own sub-folders.
  const choices = useMemo(() => {
    const blocked = folderAndDescendants(folders, folder.id);
    return flattenTree(buildFolderTree(folders)).filter(
      (c) => !blocked.has(c.id),
    );
  }, [folders, folder.id]);
  const unchanged = target === (folder.parentId ?? TOP_LEVEL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const parentId = target === TOP_LEVEL ? null : target;
    const moved = await onMove(folder.id, parentId);
    setSaving(false);
    if (moved) onOpenChange(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="move-folder-target">Move to</FieldLabel>
          <Select
            value={target}
            onValueChange={(next) => {
              if (next) setTarget(next); // Radix fires "" on re-render
            }}
          >
            <SelectTrigger id="move-folder-target" className="w-full">
              <SelectValue>
                {folderChoiceLabel(choices, target, TOP_LEVEL_LABEL)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={TOP_LEVEL}>
                  <ChoiceLabel {...TOP_LEVEL_LABEL} />
                </SelectItem>
              </SelectGroup>
              {choices.length > 0 ? <SelectSeparator /> : null}
              <SelectGroup>
                <FolderChoiceItems choices={choices} />
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={unchanged || saving}>
            {saving ? <Spinner data-icon="inline-start" /> : null}
            Move
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  );
}
