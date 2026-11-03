import Image from "next/image";
import { formatBytes, timeAgo } from "@/lib/format";
import { imageSrc, type GalleryImage } from "@/lib/types";

/** A stored image plus the drawing it belongs to. */
export type ImageItem = GalleryImage & { title: string; tags: string[] };

/** Height of the two caption lines under each square tile. */
export const TILE_CAPTION_PX = 40;

type Props = {
  item: ImageItem;
  /** First row: load now, it is what the page paints first. */
  eager?: boolean;
  onOpen: () => void;
};

/** Square thumbnail (lazy-loaded) with the drawing's title underneath. */
export function ImageTile({ item, eager = false, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/tile flex min-w-0 flex-col gap-1.5 text-left outline-none"
    >
      <span className="relative block aspect-square w-full overflow-hidden bg-muted ring-1 ring-foreground/10 transition-shadow group-hover/tile:ring-foreground/30 group-focus-visible/tile:ring-2 group-focus-visible/tile:ring-ring">
        <Image
          src={imageSrc(item)}
          alt={`Image in ${item.title}`}
          fill
          unoptimized
          loading={eager ? "eager" : "lazy"}
          sizes="200px"
          className="object-contain p-1"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium">{item.title}</span>
        <span className="truncate text-xs text-muted-foreground tabular-nums">
          {formatBytes(item.bytes)} · {timeAgo(item.createdAt)}
        </span>
      </span>
    </button>
  );
}
