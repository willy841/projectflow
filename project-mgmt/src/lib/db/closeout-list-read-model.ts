import { createPhase1DbClient } from '@/lib/db/phase1-client';

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
  const result = await db.query<CloseoutListRow>(`
    with latest_confirmations as (
      select distinct on (tc.project_id, tc.flow_type, tc.task_id)
        tc.project_id,
        tc.flow_type,
        tc.id
      from task_confirmations tc
      where tc.status = 'confirmed'
      order by tc.project_id, tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc
    ),
    confirmation_costs as (
      select
        lc.project_id,
        coalesce(sum((nullif(ts.payload_json ->> 'amount', '')::numeric)), 0)::float8 as total
      from latest_confirmations lc
      inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = lc.id
      group by lc.project_id
    ),
    manual_costs as (
      select
        project_id,
        coalesce(sum(amount) filter (where included_in_cost = true), 0)::float8 as total
      from financial_manual_costs
      group by project_id
    ),
    quotation_totals as (
      select
        fqi.project_id,
        coalesce(sum(fqli.quantity * fqli.unit_price), 0)::float8 as total
      from financial_quotation_imports fqi
      inner join financial_quotation_line_items fqli on fqli.quotation_import_id = fqi.id
      where fqi.is_active = true
      group by fqi.project_id
    )
    select
      p.id,
      p.name as "projectName",
      coalesce(p.client_name, '未填寫') as "clientName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      coalesce(to_char(p.event_date, 'YYYY'), '-') as "eventYear",
      coalesce(qt.total, 0)::float8 as "quotationTotal",
      (coalesce(cc.total, 0) + coalesce(mc.total, 0))::float8 as "projectCostTotal",
      (coalesce(qt.total, 0) - (coalesce(cc.total, 0) + coalesce(mc.total, 0)))::float8 as "grossProfit"
    from projects p
    left join quotation_totals qt on qt.project_id = p.id
    left join confirmation_costs cc on cc.project_id = p.id
    left join manual_costs mc on mc.project_id = p.id
    where coalesce(p.status, '') in ('已結案', '結案')
    order by p.event_date desc nulls last, p.created_at desc
  `);

  return result.rows;
}
