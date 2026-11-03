"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { ImageTile, TILE_CAPTION_PX, type ImageItem } from "./image-tile";

const MIN_TILE_PX = 150;
const GAP_PX = 12;

type Box = { width: number; top: number };

/** The grid's width and its distance from the top of the page. */
function useGridBox() {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>({ width: 0, top: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setBox({ width: rect.width, top: rect.top + window.scrollY });
    });
    observer.observe(el);
    // the filters above the grid can wrap onto more lines and push it down
    if (el.parentElement) observer.observe(el.parentElement);
    return () => observer.disconnect();
  }, []);

  return { ref, box };
}

type Props = { items: ImageItem[]; onOpen: (index: number) => void };

/**
 * Virtualized grid: only the rows near the viewport exist in the DOM, so
 * thousands of images cost the same as a screenful. Tiles also lazy-load.
 */
export function ImageGrid({ items, onOpen }: Props) {
  const { ref, box } = useGridBox();
  const cols = Math.max(
    2,
    Math.floor((box.width + GAP_PX) / (MIN_TILE_PX + GAP_PX)),
  );
  const tile = box.width ? (box.width - GAP_PX * (cols - 1)) / cols : 0;
  const rowHeight = tile + TILE_CAPTION_PX + GAP_PX;

  const virtualizer = useWindowVirtualizer({
    count: Math.ceil(items.length / cols),
    estimateSize: () => rowHeight,
    overscan: 3,
    scrollMargin: box.top,
  });

  // Columns or tile size changed: every row's height changed with them.
  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, rowHeight]);

  return (
    <div
      ref={ref}
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {box.width > 0
        ? virtualizer.getVirtualItems().map((row) => (
            <div
              key={row.key}
              className="absolute top-0 left-0 grid w-full"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gap: GAP_PX,
                transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              {items
                .slice(row.index * cols, (row.index + 1) * cols)
                .map((item, i) => (
                  <ImageTile
                    key={`${item.drawingId}/${item.fileId}`}
                    item={item}
                    eager={row.index === 0}
                    onOpen={() => onOpen(row.index * cols + i)}
                  />
                ))}
            </div>
          ))
        : null}
    </div>
  );
}
