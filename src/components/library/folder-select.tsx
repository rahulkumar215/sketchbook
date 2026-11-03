"use client";

import { Inbox, Layers } from "lucide-react";
import { useMemo } from "react";
import {
  ChoiceLabel,
  FolderChoiceItems,
  folderChoiceLabel,
} from "./folder-choices";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFolderTree, flattenTree } from "@/lib/folder-tree";
import { ALL, UNFILED, type Selection } from "@/lib/library-filter";
import type { LibraryFolder } from "@/lib/types";

const ALL_LABEL = { icon: Layers, text: "All folders" };
const UNFILED_LABEL = { icon: Inbox, text: "Unfiled" };

type Props = {
  folders: LibraryFolder[];
  value: Selection;
  onChange: (selection: Selection) => void;
};

/**
 * "All folders" / "Unfiled", then every folder as a tree. Closed, it shows
 * the full path ("Frontend / Performance").
 */
export function FolderSelect({ folders, value, onChange }: Props) {
  const choices = useMemo(
    () => flattenTree(buildFolderTree(folders)),
    [folders],
  );
  const fallback = value === UNFILED ? UNFILED_LABEL : ALL_LABEL;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        // Radix fires "" when the value matches no item: ignore it.
        if (next) onChange(next);
      }}
    >
      <SelectTrigger
        className="min-w-0 flex-1 sm:w-56 sm:flex-none"
        aria-label="Folder"
      >
        <SelectValue>{folderChoiceLabel(choices, value, fallback)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>
            <ChoiceLabel {...ALL_LABEL} />
          </SelectItem>
          <SelectItem value={UNFILED}>
            <ChoiceLabel {...UNFILED_LABEL} />
          </SelectItem>
        </SelectGroup>
        {choices.length > 0 ? <SelectSeparator /> : null}
        <SelectGroup>
          <FolderChoiceItems choices={choices} />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
