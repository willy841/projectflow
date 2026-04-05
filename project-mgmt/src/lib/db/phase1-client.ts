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

let poolSingleton: Pool | null = null;

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL or POSTGRES_URL');
  }
  return databaseUrl;
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
