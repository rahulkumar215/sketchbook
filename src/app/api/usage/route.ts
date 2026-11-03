import { withAuth } from "@/lib/api";
import { db } from "@/lib/db";
import type { UsageData } from "@/lib/types";

type SizeRow = { total: bigint; images: bigint; drawings: bigint };
type LargestRow = {
  id: string;
  title: string;
  scene_bytes: bigint;
  image_bytes: bigint;
};
/** day is 'YYYY-MM-DD' (cast to text in SQL). */
type GrowthRow = { day: string; cumulative: bigint };

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Turn sparse per-day totals into one point per day up to today. */
function fillDays(rows: GrowthRow[]): UsageData["growth"] {
  if (rows.length === 0) return [];
  const byDay = new Map(rows.map((r) => [r.day, Number(r.cumulative)]));
  const out: UsageData["growth"] = [];
  let running = 0;
  const end = Math.max(
    Date.parse(isoDay(new Date())),
    Date.parse(rows[rows.length - 1].day),
  );
  for (let t = Date.parse(rows[0].day); t <= end; t += DAY_MS) {
    const day = isoDay(new Date(t));
    running = byDay.get(day) ?? running;
    out.push({ date: day, bytes: running });
  }
  return out;
}

async function loadUsage(): Promise<UsageData> {
  const prisma = db();
  const [sizes, counts, tags, largest, growth] = await Promise.all([
    prisma.$queryRaw<SizeRow[]>`
      SELECT pg_database_size(current_database())   AS total,
             pg_total_relation_size('drawing_files') AS images,
             pg_total_relation_size('drawings')      AS drawings`,
    Promise.all([
      prisma.drawing.count(),
      prisma.folder.count(),
      prisma.drawingFile.count(),
    ]),
    prisma.$queryRaw<{ n: bigint }[]>`
      SELECT count(DISTINCT tag) AS n FROM drawings, unnest(tags) AS tag`,
    prisma.$queryRaw<LargestRow[]>`
      SELECT id, title, scene_bytes, image_bytes
      FROM (
        SELECT d.id::text AS id, d.title,
               (pg_column_size(d.elements) + pg_column_size(d.app_state))::bigint
                 AS scene_bytes,
               COALESCE(sum(pg_column_size(f.data_url)), 0)::bigint AS image_bytes
        FROM drawings d
        LEFT JOIN drawing_files f ON f.drawing_id = d.id
        GROUP BY d.id
      ) s
      ORDER BY scene_bytes + image_bytes DESC
      LIMIT 10`,
    prisma.$queryRaw<GrowthRow[]>`
      WITH items AS (
        SELECT created_at::date AS day,
               pg_column_size(elements) + pg_column_size(app_state) AS bytes
        FROM drawings
        UNION ALL
        SELECT created_at::date, pg_column_size(data_url) FROM drawing_files
      )
      SELECT day::text AS day,
             (sum(sum(bytes)) OVER (ORDER BY day))::bigint AS cumulative
      FROM items GROUP BY day ORDER BY day`,
  ]);

  const s = sizes[0];
  const images = Number(s.images);
  const drawings = Number(s.drawings);
  return {
    totalBytes: Number(s.total),
    breakdown: {
      images,
      drawings,
      other: Math.max(0, Number(s.total) - images - drawings),
    },
    counts: {
      drawings: counts[0],
      folders: counts[1],
      images: counts[2],
      tags: Number(tags[0]?.n ?? 0),
    },
    largest: largest.map((r) => ({
      id: r.id,
      title: r.title,
      sceneBytes: Number(r.scene_bytes),
      imageBytes: Number(r.image_bytes),
    })),
    growth: fillDays(growth),
  };
}

/** Storage numbers for the usage dashboard. */
export const GET = withAuth(async () => Response.json(await loadUsage()));
