import { z } from "zod";
import { jsonError, withAuth } from "@/lib/api";
import { db } from "@/lib/db";

type Ctx = RouteContext<"/api/images/[drawingId]/[fileId]">;

/** "data:image/webp;base64,AAAA" -> the raw bytes. */
function decodeDataUrl(dataUrl: string): Uint8Array<ArrayBuffer> {
  const comma = dataUrl.indexOf(",");
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const buffer = header.endsWith(";base64")
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  return new Uint8Array(buffer);
}

/**
 * One image as real bytes, so the gallery can use plain <img> tags (lazy
 * loading, browser caching). Content never changes for an id, so it is
 * cached for a year. The CSP sandbox stops an SVG opened directly in a tab
 * from running scripts on this origin.
 */
export const GET = withAuth(async (_req, ctx: Ctx) => {
  const { drawingId, fileId } = await ctx.params;
  if (!z.uuid().safeParse(drawingId).success) {
    return jsonError(404, "Not found");
  }
  const file = await db().drawingFile.findUniqueOrThrow({
    where: { drawingId_id: { drawingId, id: fileId } },
    select: { dataUrl: true, mimeType: true },
  });
  const bytes = decodeDataUrl(file.dataUrl);
  return new Response(bytes, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
});
