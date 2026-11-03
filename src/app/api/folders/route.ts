import { parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import { createFolderSchema } from "@/lib/validators";

export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, createFolderSchema);
  if (!parsed.ok) return parsed.response;

  const folder = await db().folder.create({
    data: parsed.data,
    select: { id: true, name: true, parentId: true },
  });
  return Response.json(folder, { status: 201 });
});
