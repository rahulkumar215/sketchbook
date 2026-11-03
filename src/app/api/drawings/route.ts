import { parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import { createDrawingSchema } from "@/lib/validators";

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, createDrawingSchema);
  if (!parsed.ok) return parsed.response;

  const drawing = await db().drawing.create({
    data: {
      title: parsed.data.title ?? "Untitled",
      folderId: parsed.data.folderId,
    },
    select: { id: true },
  });
  return Response.json(drawing, { status: 201 });
});
