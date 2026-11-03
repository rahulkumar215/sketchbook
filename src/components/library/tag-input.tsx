"use client";

import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";

type Props = {
  id?: string;
  value: string[];
  suggestions: string[];
  invalid?: boolean;
  onChange: (tags: string[]) => void;
};

/**
 * Type a tag and press Enter or comma; click a suggestion to add it.
 * Built on the theme's InputGroup so it matches every other field.
 */
export function TagInput({ id, value, suggestions, invalid, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim().toLowerCase().slice(0, 40);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const query = draft.trim().toLowerCase();
  const unused = suggestions
    .filter((s) => !value.includes(s) && s.includes(query))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-2">
      <InputGroup className="h-auto min-h-8 flex-wrap gap-1 px-1 py-1">
        {value.map((tag) => (
          <TagChip key={tag} tag={tag} onRemove={() => remove(tag)} />
        ))}
        <InputGroupInput
          id={id}
          value={draft}
          aria-invalid={invalid}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? "Add another" : "Type a tag, press Enter"}
          className="h-6 min-w-24 px-1"
        />
      </InputGroup>
      {unused.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {unused.map((tag) => (
            <Badge key={tag} variant="outline" asChild>
              <button type="button" onClick={() => add(tag)}>
                <Plus data-icon="inline-start" />
                {tag}
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TagChip({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <Badge className="pr-0.5">
      {tag}
      <button
        type="button"
        aria-label={`Remove tag ${tag}`}
        onClick={onRemove}
        className="inline-flex size-4 items-center justify-center opacity-70 hover:bg-primary-foreground/20 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-primary-foreground"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
