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

export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL or POSTGRES_URL');
  }
  return databaseUrl;
}

export function createPhase1DbClient(): Phase1DbClient {
  throw new Error(
    'Phase1DbClient is not wired yet. Provide a runtime adapter after PostgreSQL client choice is finalized.',
  );
}
