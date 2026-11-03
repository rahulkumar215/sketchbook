"use client";

import { ImageOff, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ImageGrid } from "./image-grid";
import type { ImageItem } from "./image-tile";
import { ImageViewer } from "./image-viewer";
import { FolderSelect } from "@/components/library/folder-select";
import { useLibrary } from "@/components/library/library-context";
import { ActiveTags, TagFilter } from "@/components/library/tag-filter";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, toErrorMessage } from "@/lib/client-api";
import { ALL, filterDrawings, tagCounts } from "@/lib/library-filter";
import type { GalleryImage } from "@/lib/types";

type Load =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; images: GalleryImage[] };

function useGalleryImages(): Load {
  const [load, setLoad] = useState<Load>({ status: "loading" });
  useEffect(() => {
    let active = true;
    apiFetch<GalleryImage[]>("/api/images")
      .then((images) => {
        if (active) setLoad({ status: "ready", images });
      })
      .catch((e: unknown) => {
        if (active) setLoad({ status: "error", message: toErrorMessage(e) });
      });
    return () => {
      active = false;
    };
  }, []);
  return load;
}

function LoadingGrid() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
      aria-busy="true"
      aria-label="Loading images"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  );
}

function NoImages({ filtered }: { filtered: boolean }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImageOff />
        </EmptyMedia>
        <EmptyTitle>
          {filtered ? "No matching images" : "No images yet"}
        </EmptyTitle>
        <EmptyDescription>
          {filtered
            ? "Nothing matches your search, folder or tags."
            : "Paste a screenshot into any drawing and it will show up here."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** Every pasted image across all drawings, filterable by the drawing. */
export function ImagesPage() {
  const library = useLibrary();
  const load = useGalleryImages();
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState(ALL);
  const [tags, setTags] = useState<string[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);

  const images = useMemo(
    () => (load.status === "ready" ? load.images : []),
    [load],
  );

  // Only offer tags of drawings that actually hold images.
  const tagList = useMemo(() => {
    const withImages = new Set(images.map((i) => i.drawingId));
    return tagCounts(library.drawings.filter((d) => withImages.has(d.id)));
  }, [images, library.drawings]);

  // Filter drawings exactly like the library page, then keep their images.
  const items = useMemo<ImageItem[]>(() => {
    const matching = filterDrawings({
      drawings: library.drawings,
      folders: library.folders,
      selection: folder,
      search,
      tags,
    });
    const byId = new Map(matching.map((d) => [d.id, d]));
    return images.flatMap((image) => {
      const drawing = byId.get(image.drawingId);
      return drawing
        ? [{ ...image, title: drawing.title, tags: drawing.tags }]
        : [];
    });
  }, [images, library.drawings, library.folders, folder, search, tags]);

  const ready = load.status === "ready" && library.loaded;
  const filtered = Boolean(search || tags.length || folder !== ALL);

  // A filter change reshuffles the list, so close the viewer.
  function filterWith<T>(set: (value: T) => void) {
    return (value: T) => {
      setViewing(null);
      set(value);
    };
  }

  return (
    <>
      <PageHeader
        title="Images"
        description={
          ready ? `${items.length} of ${images.length} images` : undefined
        }
      />
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <InputGroup className="sm:flex-1">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => filterWith(setSearch)(e.target.value)}
              placeholder="Search by drawing title or tag"
              aria-label="Search images by drawing"
            />
          </InputGroup>
          <div className="flex gap-2">
            <FolderSelect
              tree={library.tree}
              value={folder}
              onChange={filterWith(setFolder)}
            />
            <TagFilter
              tags={tagList}
              value={tags}
              onChange={filterWith(setTags)}
            />
          </div>
        </div>
        <ActiveTags value={tags} onChange={filterWith(setTags)} />

        {load.status === "error" ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&rsquo;t load images</AlertTitle>
            <AlertDescription>{load.message}</AlertDescription>
          </Alert>
        ) : null}
        {load.status === "loading" || !library.loaded ? <LoadingGrid /> : null}
        {ready && items.length === 0 ? <NoImages filtered={filtered} /> : null}
        {ready && items.length > 0 ? (
          <ImageGrid items={items} onOpen={setViewing} />
        ) : null}
      </div>
      <ImageViewer items={items} index={viewing} onIndexChange={setViewing} />
    </>
  );
}
