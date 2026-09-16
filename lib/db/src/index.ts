import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export let pool: pg.Pool | undefined;
export let db: any;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} catch {
  console.warn('[AI Studio] Database not connected — using mock');

  const createChain = (defaultResult: any) => {
    let result = defaultResult;
    const chain: any = {};
    chain.from = () => chain;
    chain.where = () => chain;
    chain.limit = () => chain;
    chain.offset = () => chain;
    chain.orderBy = () => chain;
    chain.groupBy = () => chain;
    chain.values = (v: any) => { result = [v]; return chain; };
    chain.set = (v: any) => { result = [v]; return chain; };
    chain.returning = () => chain;
    chain.execute = async () => result;
    chain.then = (resolve: any) => resolve(result);
    chain.catch = () => chain;
    return chain;
  };

  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({})
  };

  db = new Proxy({}, {
    get: (_, prop) => {
      if (prop === 'query') return new Proxy({}, { get: () => noOp });
      if (prop === 'select') return () => createChain([]);
      if (prop === 'insert') return () => createChain([{}]);
      if (prop === 'update') return () => createChain([]);
      if (prop === 'delete') return () => createChain([]);
      return async () => [];
    }
  });
}

export * from "./schema";

