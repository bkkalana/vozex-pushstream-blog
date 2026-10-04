import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

type PrismaGlobal = typeof globalThis & { __pushstreamPrisma?: PrismaClient };

function adapterFromUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (url.protocol !== "mysql:") throw new Error("DATABASE_URL must use the mysql:// protocol.");

  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    connectionLimit: 10,
  });
}

const prismaGlobal = globalThis as PrismaGlobal;

export const prisma = prismaGlobal.__pushstreamPrisma ?? new PrismaClient({ adapter: adapterFromUrl(env.DATABASE_URL) });

if (env.NODE_ENV !== "production") prismaGlobal.__pushstreamPrisma = prisma;
