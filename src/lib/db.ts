import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Neon's serverless driver only speaks to Neon, so any other Postgres
 * (e.g. a local one for development) uses the standard `pg` driver.
 */
function createAdapter(connectionString: string) {
  const host = new URL(connectionString).hostname;
  return host.endsWith(".neon.tech")
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new PrismaClient({ adapter: createAdapter(connectionString) });
}

/**
 * Lazily-created Prisma client. Lazy so that importing a route during
 * `next build` never needs DATABASE_URL; cached on globalThis so dev hot
 * reloads don't open a new connection pool each time.
 */
export function db(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}
