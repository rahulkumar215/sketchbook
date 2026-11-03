import { parseBody, withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import { libraryNameFromUrl } from "@/lib/shape-libraries";
import type { AddedShapeLibrary } from "@/lib/types";
import { addShapeLibrarySchema } from "@/lib/validators";

const select = { id: true, url: true, name: true, createdAt: true } as const;

function toJson(row: {
  id: string;
  url: string;
  name: string;
  createdAt: Date;
}): AddedShapeLibrary {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

/** Saved libraries, oldest first (the seeded defaults share a timestamp). */
export const GET = withAuth(async () => {
  const rows = await db().shapeLibrary.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    select,
  });
  return Response.json(rows.map(toJson));
});

/** Remembers a library for every drawing. Adding it again is a no-op. */
export const POST = withAuth(async (req) => {
  const parsed = await parseBody(req, addShapeLibrarySchema);
  if (!parsed.ok) return parsed.response;

  const { url } = parsed.data;
  const row = await db().shapeLibrary.upsert({
    where: { url },
    create: { url, name: libraryNameFromUrl(url) },
    update: {},
    select,
  });
  return Response.json(toJson(row), { status: 201 });
});
