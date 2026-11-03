"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  tags: string[];
  value: string[];
  onChange: (tags: string[]) => void;
};

/** Row of #tag toggles; an item must carry every selected tag. */
export function TagFilter({ tags, value, onChange }: Props) {
  if (tags.length === 0) return null;
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      size="sm"
      spacing={1}
      value={value}
      onValueChange={onChange}
      aria-label="Filter by tag"
      className="flex-wrap justify-start"
    >
      {tags.map((tag) => (
        <ToggleGroupItem key={tag} value={tag}>
          #{tag}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
