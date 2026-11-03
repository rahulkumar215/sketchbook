"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Tags shown on a card before the rest fold into "+N". */
const VISIBLE_TAGS = 3;

type Props = {
  tags: string[];
  activeTags: string[];
  onTagClick: (tag: string) => void;
};

function TagButton({
  tag,
  active,
  onClick,
}: {
  tag: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    // min-w-0 + shrink: a long tag ends in "..." instead of pushing "+N" out
    <Badge
      asChild
      variant={active ? "default" : "secondary"}
      className="min-w-0 shrink"
    >
      <button type="button" onClick={onClick} title={`#${tag}`}>
        <span className="truncate">#{tag}</span>
      </button>
    </Badge>
  );
}

/**
 * A card's tags on one line: the filtered-by ones first, then the rest up
 * to VISIBLE_TAGS; the others sit behind a "+N" badge (a popover, so it
 * works on touch). Clicking any tag toggles it in the filter.
 */
export function CardTags({ tags, activeTags, onTagClick }: Props) {
  const ordered = [
    ...tags.filter((t) => activeTags.includes(t)),
    ...tags.filter((t) => !activeTags.includes(t)),
  ];
  const shown = ordered.slice(0, VISIBLE_TAGS);
  const hidden = ordered.slice(VISIBLE_TAGS);
  const tagButton = (tag: string) => (
    <TagButton
      key={tag}
      tag={tag}
      active={activeTags.includes(tag)}
      onClick={() => onTagClick(tag)}
    />
  );

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
      {shown.map(tagButton)}
      {hidden.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <Badge asChild variant="outline" className="shrink-0">
              <button
                type="button"
                aria-label={`${hidden.length} more tags`}
                className="tabular-nums"
              >
                +{hidden.length}
              </button>
            </Badge>
          </PopoverTrigger>
          <PopoverContent align="start" className="flex-row flex-wrap gap-1">
            {hidden.map(tagButton)}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
}
