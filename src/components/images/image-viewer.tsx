"use client";

import { ChevronLeft, ChevronRight, Download, PenLine } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import type { ImageItem } from "./image-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes, timeAgo } from "@/lib/format";
import { imageSrc } from "@/lib/types";

type Props = {
  items: ImageItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

function fileName(item: ImageItem): string {
  const ext = item.mimeType
    .split("/")[1]
    .replace("svg+xml", "svg")
    .replace("jpeg", "jpg");
  const base = item.title.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "");
  return `${base || "image"}-${item.fileId.slice(0, 8)}.${ext}`;
}

/** Full-size view of one image; arrow keys step through the filtered list. */
export function ImageViewer({ items, index, onIndexChange }: Props) {
  const item = index === null ? undefined : items[index];
  const current = index ?? 0;

  function step(delta: number) {
    const next = current + delta;
    if (next >= 0 && next < items.length) onIndexChange(next);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  }

  return (
    <Dialog
      open={item !== undefined}
      onOpenChange={(open) => {
        if (!open) onIndexChange(null);
      }}
    >
      {item ? (
        <DialogContent className="sm:max-w-4xl" onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{item.title}</DialogTitle>
            <DialogDescription className="tabular-nums">
              {current + 1} of {items.length} · {formatBytes(item.bytes)} ·
              added {timeAgo(item.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="relative h-[55vh] w-full bg-muted sm:h-[65vh]">
            <Image
              src={imageSrc(item)}
              alt={`Image in ${item.title}`}
              fill
              unoptimized
              sizes="(min-width: 640px) 896px, 92vw"
              className="object-contain"
            />
          </div>
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous image"
                disabled={current === 0}
                onClick={() => step(-1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next image"
                disabled={current >= items.length - 1}
                onClick={() => step(1)}
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1 sm:flex-none">
                <a href={imageSrc(item)} download={fileName(item)}>
                  <Download data-icon="inline-start" />
                  Download
                </a>
              </Button>
              <Button asChild className="flex-1 sm:flex-none">
                <Link href={`/d/${item.drawingId}`}>
                  <PenLine data-icon="inline-start" />
                  Open drawing
                </Link>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
