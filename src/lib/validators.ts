import { z } from "zod";

/** Vercel rejects request bodies over 4.5 MB; stay safely under it. */
export const MAX_FILE_DATA_URL_CHARS = 4_000_000;

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/avif",
] as const;

const title = z
  .string()
  .trim()
  .min(1, "Give it a title")
  .max(200, "Keep the title under 200 characters");
const folderName = z
  .string()
  .trim()
  .min(1, "Give the folder a name")
  .max(100, "Keep the name under 100 characters");
const jsonObject = z.record(z.string(), z.json());

const tagList = z
  .array(z.string().trim().min(1).max(40))
  .max(30)
  .transform((tags) => [...new Set(tags.map((t) => t.toLowerCase()))]);

export const loginSchema = z.object({
  password: z.string().min(1, "Enter your password").max(200),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const createFolderSchema = z.object({
  name: folderName,
  parentId: z.uuid().nullable(),
});

export const updateFolderSchema = z.object({
  name: folderName.optional(),
  parentId: z.uuid().nullable().optional(),
});

export const createDrawingSchema = z.object({
  title: title.optional(),
  folderId: z.uuid().nullable(),
});

export const updateDrawingSchema = z.object({
  title: title.optional(),
  folderId: z.uuid().nullable().optional(),
  tags: tagList.optional(),
  elements: z.array(jsonObject).optional(),
  appState: jsonObject.optional(),
  /** Image ids still used by the scene; any other stored image is pruned. */
  fileIds: z.array(z.string().min(1).max(100)).optional(),
});

export const uploadFileSchema = z.object({
  id: z.string().min(1).max(100),
  mimeType: z.enum(IMAGE_MIME_TYPES),
  dataURL: z
    .string()
    .max(MAX_FILE_DATA_URL_CHARS)
    .regex(/^data:image\/[a-z0-9+.-]+;base64,/),
});

/* ---- Form schemas (browser, react-hook-form) ---- */

export const folderFormSchema = z.object({ name: folderName });
export type FolderFormValues = z.infer<typeof folderFormSchema>;

export const drawingDetailsSchema = z.object({
  title,
  folderId: z.uuid().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(30, "Up to 30 tags"),
});
export type DrawingDetails = z.infer<typeof drawingDetailsSchema>;

export type UpdateDrawingInput = z.input<typeof updateDrawingSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
