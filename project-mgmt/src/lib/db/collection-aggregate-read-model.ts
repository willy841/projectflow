import { createPhase1DbClient } from '@/lib/db/phase1-client';

export async function getProjectCollectedTotal(projectId: string): Promise<number> {
  const db = createPhase1DbClient();
  const rows = await db.query<{ total: number | null }>(`
    select coalesce(sum(amount), 0)::float8 as total
    from project_collection_records
    where project_id = $1
  `, [projectId]);

  return rows.rows[0]?.total ?? 0;
}
