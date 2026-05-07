import { createPhase1DbClient } from '@/lib/db/phase1-client';

export type ProjectCollectionRecordRow = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export async function listProjectCollectionRecords(projectId: string): Promise<ProjectCollectionRecordRow[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<ProjectCollectionRecordRow>(`
    select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
    from project_collection_records
    where project_id = $1
    order by collected_on desc, created_at desc
  `, [projectId]);

  return rows.rows;
}
