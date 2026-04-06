import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { DataType, newDb } from 'pg-mem';
import { Pool } from 'pg';

export interface QueryResultRow {
  [key: string]: unknown;
}

export interface QueryResult<TRow extends QueryResultRow = QueryResultRow> {
  rows: TRow[];
}

export interface Phase1DbClient {
  query<TRow extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<TRow>>;
}

type PgMemLogEntry = {
  sql: string;
  params: unknown[];
};

let poolSingleton: Pool | null = null;

export function shouldUsePgMem(): boolean {
  return process.env.PROJECTFLOW_USE_PGMEM === '1';
}

export function getDatabaseUrl(): string {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (!databaseUrl) {
    throw new Error(
      'Missing DATABASE_URL/POSTGRES_URL/POSTGRES_PRISMA_URL/POSTGRES_URL_NON_POOLING',
    );
  }

  try {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error(`Unsupported database protocol: ${parsed.protocol}`);
    }
  } catch (error) {
    throw new Error(
      `Invalid database URL. Check Vercel env DATABASE_URL (or fallback POSTGRES_* vars). ${error instanceof Error ? error.message : ''}`,
    );
  }

  return databaseUrl;
}

function loadPhase1MigrationSql(): string {
  const filePath = path.resolve(process.cwd(), 'db/migrations/0001_projectflow_phase1/up.sql');
  const rawSql = readFileSync(filePath, 'utf8');

  return rawSql
    .replace(/^create extension if not exists pgcrypto;\s*$/gim, '')
    .replace(/^create or replace function set_updated_at\(\)[\s\S]*?\$\$ language plpgsql;\s*$/gim, '')
    .replace(/create trigger[\s\S]*?execute function set_updated_at\(\);\s*/gim, '')
    .replace(/^begin;\s*$/gim, '')
    .replace(/^commit;\s*$/gim, '');
}

function getPgMemLogPath() {
  return path.resolve(process.cwd(), '.tmp/pgmem-phase1-log.json');
}

function readPgMemLog(): PgMemLogEntry[] {
  const filePath = getPgMemLogPath();
  if (!existsSync(filePath)) return [];
  return JSON.parse(readFileSync(filePath, 'utf8')) as PgMemLogEntry[];
}

function writePgMemLog(entries: PgMemLogEntry[]) {
  const filePath = getPgMemLogPath();
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(entries, null, 2));
}

function appendPgMemLog(entry: PgMemLogEntry) {
  const entries = readPgMemLog();
  entries.push(entry);
  writePgMemLog(entries);
}

function isMutatingSql(sql: string) {
  return /^\s*(insert|update|delete)\b/i.test(sql);
}

function createPgMemPoolFromLog(): Pool {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  db.public.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    impure: true,
    implementation: () => crypto.randomUUID(),
  });
  db.public.registerFunction({
    name: 'to_char',
    args: [DataType.date, DataType.text],
    returns: DataType.text,
    implementation: (value: Date | string | null) => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      return String(value).slice(0, 10);
    },
  });

  db.public.none(loadPhase1MigrationSql());
  const adapter = db.adapters.createPg();
  const pool = new adapter.Pool();

  return pool;
}

async function queryWithPgMem<TRow extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<TRow>> {
  const pool = createPgMemPoolFromLog();

  try {
    for (const entry of readPgMemLog()) {
      await pool.query(entry.sql, entry.params);
    }

    const result = await pool.query<TRow>(sql, [...params]);

    if (isMutatingSql(sql)) {
      appendPgMemLog({ sql, params: [...params] });
    }

    return { rows: result.rows };
  } finally {
    await pool.end();
  }
}

function getPool(): Pool {
  if (!poolSingleton) {
    poolSingleton = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return poolSingleton;
}

export function createPhase1DbClient(): Phase1DbClient {
  if (shouldUsePgMem()) {
    return {
      async query<TRow extends QueryResultRow = QueryResultRow>(
        sql: string,
        params: readonly unknown[] = [],
      ): Promise<QueryResult<TRow>> {
        return queryWithPgMem<TRow>(sql, params);
      },
    };
  }

  const pool = getPool();

  return {
    async query<TRow extends QueryResultRow = QueryResultRow>(
      sql: string,
      params: readonly unknown[] = [],
    ): Promise<QueryResult<TRow>> {
      const result = await pool.query<TRow>(sql, [...params]);
      return {
        rows: result.rows,
      };
    },
  };
}
