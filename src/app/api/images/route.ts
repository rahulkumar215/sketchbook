import { withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import type { GalleryImage } from "@/lib/types";

type Row = {
  drawing_id: string;
  file_id: string;
  mime_type: string;
  bytes: bigint;
  created_at: Date;
};

/**
 * Every stored image, newest first, without the image data itself.
 * octet_length() reads the TOAST header, so this never decompresses the
 * images: it stays cheap however many there are.
 */
export const GET = withAuth(async () => {
  const rows = await db().$queryRaw<Row[]>`
    SELECT drawing_id::text AS drawing_id,
           id AS file_id,
           mime_type,
           (octet_length(data_url) * 3 / 4)::bigint AS bytes,
           created_at
    FROM drawing_files
    ORDER BY created_at DESC, id`;
  const images: GalleryImage[] = rows.map((r) => ({
    drawingId: r.drawing_id,
    fileId: r.file_id,
    mimeType: r.mime_type,
    bytes: Number(r.bytes),
    createdAt: r.created_at.toISOString(),
  }));
  return Response.json(images);
});
