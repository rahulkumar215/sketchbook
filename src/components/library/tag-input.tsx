"use client";

import { Plus, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string[];
  suggestions: string[];
  invalid?: boolean;
  onChange: (tags: string[]) => void;
};

/** Type a tag and press Enter or comma; click a suggestion to add it. */
export function TagInput({ id, value, suggestions, invalid, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const tag = raw.trim().toLowerCase().slice(0, 40);
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
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
      <div
        aria-invalid={invalid}
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
          invalid && "border-destructive",
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
            >
              <X />
            </button>
          </Badge>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? "" : "Type a tag, press Enter"}
          className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {unused.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => add(tag)}
            >
              <Plus data-icon="inline-start" />
              {tag}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
