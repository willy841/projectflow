import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { ensureCloseoutSnapshotTable } from '@/lib/db/closeout-retained-snapshot';

export type CloseoutListRow = {
  id: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  eventYear: string;
  quotationTotal: number;
  projectCostTotal: number;
  grossProfit: number;
};

export async function getCloseoutListReadModel(): Promise<CloseoutListRow[]> {
  const db = createPhase1DbClient();
  await ensureCloseoutSnapshotTable();
  const snapshotResult = await db.query<CloseoutListRow>(`
    select
      p.id,
      p.name as "projectName",
      coalesce(p.client_name, '未填寫') as "clientName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      coalesce(to_char(p.event_date, 'YYYY'), '-') as "eventYear",
      coalesce(fcs.quotation_total, 0)::float8 as "quotationTotal",
      coalesce(fcs.project_cost_total, 0)::float8 as "projectCostTotal",
      coalesce(fcs.gross_profit, 0)::float8 as "grossProfit"
    from projects p
    inner join financial_closeout_snapshots fcs on fcs.project_id = p.id
    where coalesce(p.status, '') in ('已結案', '結案')
    order by p.event_date desc nulls last, p.created_at desc
  `);

  if (snapshotResult.rows.length > 0) {
    return snapshotResult.rows;
  }

  return [];
}
