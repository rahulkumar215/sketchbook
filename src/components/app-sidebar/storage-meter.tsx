"use client";

import Link from "next/link";
import { useLibrary } from "@/components/library/library-context";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import { STORAGE_LIMIT_BYTES } from "@/lib/types";

/** Compact "x MB of 512 MB" meter; links to the full usage dashboard. */
export function StorageMeter() {
  const { storageBytes, loaded } = useLibrary();
  const percent = Math.min(100, (storageBytes / STORAGE_LIMIT_BYTES) * 100);

  return (
    <Link
      href="/usage"
      className="flex flex-col gap-2 border bg-background p-3 text-xs hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden"
    >
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Storage</span>
        <span className="font-medium tabular-nums">
          {loaded ? formatBytes(storageBytes) : "—"} /{" "}
          {formatBytes(STORAGE_LIMIT_BYTES)}
        </span>
      </div>
      <Progress value={percent} aria-label="Free storage used" />
    </Link>
  );
}
