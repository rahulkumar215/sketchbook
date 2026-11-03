import { parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import { uploadFileSchema } from "@/lib/validators";

type Ctx = RouteContext<"/api/drawings/[id]/files">;

/** Store one image. One per request keeps each body under Vercel's 4.5 MB. */
export const PUT = withAuth(async (req, ctx: Ctx) => {
  const { id: drawingId } = await ctx.params;
  const parsed = await parseBody(req, uploadFileSchema);
  if (!parsed.ok) return parsed.response;

  const { id, mimeType, dataURL } = parsed.data;
  await db().drawingFile.upsert({
    where: { drawingId_id: { drawingId, id } },
    create: { drawingId, id, mimeType, dataUrl: dataURL },
    update: { mimeType, dataUrl: dataURL },
    select: { id: true },
  });
  return Response.json({ ok: true });
});
