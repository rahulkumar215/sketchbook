import { parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import type { DrawingScene } from "@/lib/types";
import { updateDrawingSchema } from "@/lib/validators";

type Ctx = RouteContext<"/api/drawings/[id]">;

export const GET = withAuth(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const drawing = await db().drawing.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      title: true,
      elements: true,
      appState: true,
      files: { select: { id: true } },
    },
  });
  const body: DrawingScene = {
    id: drawing.id,
    title: drawing.title,
    elements: Array.isArray(drawing.elements) ? drawing.elements : [],
    appState:
      drawing.appState && typeof drawing.appState === "object"
        ? (drawing.appState as Record<string, unknown>)
        : {},
    fileIds: drawing.files.map((f) => f.id),
  };
  return Response.json(body);
});

export const PATCH = withAuth(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, updateDrawingSchema);
  if (!parsed.ok) return parsed.response;

  const { fileIds, ...data } = parsed.data;
  const prisma = db();
  await prisma.drawing.update({ where: { id }, data, select: { id: true } });
  if (fileIds) {
    // Images removed from the scene are deleted so they stop using storage.
    await prisma.drawingFile.deleteMany({
      where: { drawingId: id, id: { notIn: fileIds } },
    });
  }
  return Response.json({ ok: true });
});

export const DELETE = withAuth(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  await db().drawing.delete({ where: { id } });
  return Response.json({ ok: true });
});
