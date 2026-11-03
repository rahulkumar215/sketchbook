"use client";

import { ChevronDown, Hash } from "lucide-react";
import { TagChip } from "./tag-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TagCount } from "@/lib/library-filter";

type Props = {
  tags: TagCount[];
  value: string[];
  onChange: (tags: string[]) => void;
};

function toggled(value: string[], tag: string): string[] {
  return value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag];
}

/**
 * "Tags" button opening a searchable checklist (most used first), so the
 * toolbar stays one line however many tags exist. An item must carry every
 * selected tag. Show the selection with <ActiveTags> below the toolbar.
 */
export function TagFilter({ tags, value, onChange }: Props) {
  if (tags.length === 0) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <Hash data-icon="inline-start" />
          Tags
          {value.length > 0 ? (
            <Badge className="tabular-nums">{value.length}</Badge>
          ) : null}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <Command>
          <CommandInput placeholder={`Search ${tags.length} tags`} />
          <CommandList>
            <CommandEmpty>No tags match</CommandEmpty>
            <CommandGroup>
              {tags.map(({ tag, count }) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  data-checked={value.includes(tag)}
                  onSelect={() => onChange(toggled(value, tag))}
                >
                  <span className="flex-1 truncate">#{tag}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/** The selected tags as removable chips, plus "Clear". */
export function ActiveTags({
  value,
  onChange,
}: Pick<Props, "value" | "onChange">) {
  if (value.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {value.map((tag) => (
        <TagChip
          key={tag}
          tag={tag}
          label={`#${tag}`}
          onRemove={() => onChange(toggled(value, tag))}
        />
      ))}
      <Button variant="link" size="xs" onClick={() => onChange([])}>
        Clear
      </Button>
    </div>
  );
}
