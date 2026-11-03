import { withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import type { LibraryData } from "@/lib/types";

/** Everything the home screen needs in one call: folders, drawings, usage. */
export const GET = withAuth(async () => {
  const prisma = db();
  const [folders, drawings, size] = await Promise.all([
    prisma.folder.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, parentId: true },
    }),
    prisma.drawing.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        folderId: true,
        tags: true,
        updatedAt: true,
      },
    }),
    prisma.$queryRaw<{ bytes: bigint }[]>`
      SELECT pg_database_size(current_database()) AS bytes`,
  ]);

  const body: LibraryData = {
    folders,
    drawings: drawings.map((d) => ({
      ...d,
      updatedAt: d.updatedAt.toISOString(),
    })),
    storageBytes: Number(size[0]?.bytes ?? 0),
  };
  return Response.json(body);
});
