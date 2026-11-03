import { z } from "zod";
import { jsonError, withAuth } from "@/lib/api";
import { db } from "@/lib/db";

type Ctx = RouteContext<"/api/shape-libraries/[id]">;

/**
 * Forgets an added library: it stops loading into the Library panel.
 * Shapes already placed in drawings are ordinary elements and stay.
 */
export const DELETE = withAuth(async (_req, ctx: Ctx) => {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return jsonError(404, "Not found");

  await db().shapeLibrary.delete({ where: { id }, select: { id: true } });
  return new Response(null, { status: 204 });
});
