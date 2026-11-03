/** Shapes shared by the API routes and the browser. */

export type LibraryFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

export type LibraryDrawing = {
  id: string;
  title: string;
  folderId: string | null;
  tags: string[];
  updatedAt: string;
};

export type LibraryData = {
  folders: LibraryFolder[];
  drawings: LibraryDrawing[];
  storageBytes: number;
};

export type DrawingScene = {
  id: string;
  title: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  /** Ids of stored images; each is fetched separately. */
  fileIds: string[];
};

export type StoredFile = {
  id: string;
  mimeType: string;
  dataURL: string;
  created: number;
};

export type UsageData = {
  totalBytes: number;
  /** On-disk size (incl. indexes) per kind of content. */
  breakdown: { images: number; drawings: number; other: number };
  counts: { drawings: number; folders: number; images: number; tags: number };
  largest: {
    id: string;
    title: string;
    sceneBytes: number;
    imageBytes: number;
  }[];
  /** Cumulative content size by creation day, gaps filled, oldest first. */
  growth: { date: string; bytes: number }[];
};

/** Neon's free plan allows 1 GB of storage per project (since 2026). */
export const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;

/** One stored image, without its data (that is fetched per tile). */
export type GalleryImage = {
  drawingId: string;
  fileId: string;
  mimeType: string;
  /** Decoded size, approximated from the base64 length. */
  bytes: number;
  createdAt: string;
};

/** A shape library added with "Browse libraries" (only its URL is stored). */
export type AddedShapeLibrary = {
  id: string;
  url: string;
  name: string;
  createdAt: string;
};

/** URL that serves an image's raw bytes, for <img src>. */
export function imageSrc(image: Pick<GalleryImage, "drawingId" | "fileId">) {
  return `/api/images/${image.drawingId}/${encodeURIComponent(image.fileId)}`;
}
