import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  tag: string;
  /** Text shown; defaults to the tag itself. */
  label?: string;
  onRemove: () => void;
};

/** A primary-coloured tag with a small remove button. */
export function TagChip({ tag, label = tag, onRemove }: Props) {
  return (
    <Badge className="pr-0.5">
      {label}
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
