import { withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import type { StoredFile } from "@/lib/types";

type Ctx = RouteContext<"/api/drawings/[id]/files/[fileId]">;

/**
 * Fetch one image. An image's content never changes for a given id, so the
 * browser may cache it for a year: reopening a drawing costs no DB reads.
 */
export const GET = withAuth(async (_req, ctx: Ctx) => {
  const { id: drawingId, fileId } = await ctx.params;
  const file = await db().drawingFile.findUniqueOrThrow({
    where: { drawingId_id: { drawingId, id: fileId } },
  });
  const body: StoredFile = {
    id: file.id,
    mimeType: file.mimeType,
    dataURL: file.dataUrl,
    created: file.createdAt.getTime(),
  };
  return Response.json(body, {
    headers: { "Cache-Control": "private, max-age=31536000, immutable" },
  });
});
