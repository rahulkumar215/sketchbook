"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flattenTree, type FolderNode } from "@/lib/folder-tree";
import { ALL, UNFILED, type Selection } from "@/lib/library-filter";

type Props = {
  tree: FolderNode[];
  value: Selection;
  onChange: (selection: Selection) => void;
};

/** "All folders" / "Unfiled" / every folder, indented by depth. */
export function FolderSelect({ tree, value, onChange }: Props) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        // Radix fires "" when the value matches no item: ignore it.
        if (next) onChange(next);
      }}
    >
      <SelectTrigger
        className="flex-1 sm:w-48 sm:flex-none"
        aria-label="Folder"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>All folders</SelectItem>
          <SelectItem value={UNFILED}>Unfiled</SelectItem>
          {flattenTree(tree).map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span style={{ paddingLeft: `${f.depth * 12}px` }}>{f.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
