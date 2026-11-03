import { jsonError, parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import { updateFolderSchema } from "@/lib/validators";

type Ctx = RouteContext<"/api/folders/[id]">;

/** True if `candidateParentId` is `folderId` itself or one of its children. */
async function wouldCreateCycle(folderId: string, candidateParentId: string) {
  let current: string | null = candidateParentId;
  while (current) {
    if (current === folderId) return true;
    const parent: { parentId: string | null } | null =
      await db().folder.findUnique({
        where: { id: current },
        select: { parentId: true },
      });
    current = parent?.parentId ?? null;
  }
  return false;
}

export const PATCH = withAuth(async (req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const parsed = await parseBody(req, updateFolderSchema);
  if (!parsed.ok) return parsed.response;

  const { parentId } = parsed.data;
  if (parentId && (await wouldCreateCycle(id, parentId))) {
    return jsonError(400, "A folder can't be moved inside itself");
  }
  const folder = await db().folder.update({
    where: { id },
    data: parsed.data,
    select: { id: true, name: true, parentId: true },
  });
  return Response.json(folder);
});

/**
 * Deleting a folder never deletes drawings: its sub-folders and drawings
 * move up one level to the deleted folder's parent.
 */
export const DELETE = withAuth(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  const prisma = db();
  const folder = await prisma.folder.findUniqueOrThrow({
    where: { id },
    select: { parentId: true },
  });
  await prisma.$transaction([
    prisma.folder.updateMany({
      where: { parentId: id },
      data: { parentId: folder.parentId },
    }),
    prisma.drawing.updateMany({
      where: { folderId: id },
      data: { folderId: folder.parentId },
    }),
    prisma.folder.delete({ where: { id } }),
  ]);
  return Response.json({ ok: true });
});
