"use client";

import { ArrowLeft, CircleCheck, CloudOff } from "lucide-react";
import { useState } from "react";
import type { SaveStatus } from "./useAutosave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  title: string;
  status: SaveStatus;
  error: string | null;
  onBack: () => void;
  onRename: (title: string) => void;
  onRetry: () => void;
};

function SaveIndicator({
  status,
  error,
  onRetry,
}: Pick<Props, "status" | "error" | "onRetry">) {
  if (status === "error") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive" size="sm" onClick={onRetry}>
            <CloudOff data-icon="inline-start" />
            Not saved. Retry
          </Button>
        </TooltipTrigger>
        <TooltipContent>{error ?? "Save failed"}</TooltipContent>
      </Tooltip>
    );
  }
  const busy = status === "saving" || status === "pending";
  return (
    <span
      role="status"
      className="flex items-center gap-1.5 px-2 text-xs text-muted-foreground"
    >
      {busy ? <Spinner /> : <CircleCheck className="size-4" />}
      {busy ? "Saving…" : "Saved"}
    </span>
  );
}

export function EditorHeader(props: Props) {
  const [title, setTitle] = useState(props.title);

  function commitTitle() {
    const next = title.trim();
    if (!next) setTitle(props.title);
    else if (next !== props.title) props.onRename(next.slice(0, 200));
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={props.onBack}>
            <ArrowLeft />
            <span className="sr-only">Back to all drawings</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back to all drawings</TooltipContent>
      </Tooltip>
      <Input
        value={title}
        maxLength={200}
        aria-label="Drawing title"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="h-8 max-w-md border-transparent bg-transparent font-medium shadow-none hover:border-input dark:bg-transparent"
      />
      <div className="ml-auto">
        <SaveIndicator
          status={props.status}
          error={props.error}
          onRetry={props.onRetry}
        />
      </div>
    </header>
  );
}
