import { CornerDownRight, Folder, type LucideIcon } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import type { FolderChoice } from "@/lib/folder-tree";

/** One indent step: an icon (16px) plus the item's gap (8px). */
const STEP_PX = 24;
const BASE_PX = 8;

/**
 * Folders as a tree inside a <Select>: a folder icon on every row, and
 * nested rows indented under their parent's icon with a "↳" marker.
 */
export function FolderChoiceItems({ choices }: { choices: FolderChoice[] }) {
  return choices.map((f) => (
    <SelectItem
      key={f.id}
      value={f.id}
      style={{ paddingLeft: BASE_PX + Math.max(0, f.depth - 1) * STEP_PX }}
    >
      {f.depth > 0 ? (
        <CornerDownRight className="text-muted-foreground" />
      ) : null}
      <Folder className="text-muted-foreground" />
      <span className="truncate">{f.name}</span>
    </SelectItem>
  ));
}

/**
 * What a closed folder <Select> shows: an icon and the full path, so a
 * sub-folder reads "Frontend / Performance" rather than its bare name.
 */
export function ChoiceLabel({
  icon: Icon,
  text,
}: {
  icon: LucideIcon;
  text: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="text-muted-foreground" />
      <span className="truncate">{text}</span>
    </span>
  );
}

/** The ChoiceLabel for a folder id, or `fallback` if it isn't a folder. */
export function folderChoiceLabel(
  choices: FolderChoice[],
  id: string,
  fallback: { icon: LucideIcon; text: string },
) {
  const choice = choices.find((c) => c.id === id);
  return choice ? (
    <ChoiceLabel icon={Folder} text={choice.path} />
  ) : (
    <ChoiceLabel {...fallback} />
  );
}
