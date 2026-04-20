import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { hasFinancialQuotationImportTotalAmountColumn } from '@/lib/db/quotation-schema';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';

export type CloseoutArchiveCollectionRecord = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type CloseoutArchiveVendorPaymentRecord = {
  vendorName: string;
  payableAmount: number;
  paidAmount: number;
};

export type CloseoutArchiveDetailReadModel = {
  archiveProject: QuoteCostProjectWithGroups;
  archiveCollections: CloseoutArchiveCollectionRecord[];
  archiveVendorPayments: CloseoutArchiveVendorPaymentRecord[];
  summaryTotals: {
    quotationTotal: number;
    projectCostTotal: number;
    grossProfit: number;
  };
};

function buildArchiveVendorPaymentRows(project: QuoteCostProjectWithGroups, paidRows: Array<{ vendorName: string; paidAmount: number }>): CloseoutArchiveVendorPaymentRecord[] {
  const paidMap = new Map(paidRows.map((row) => [row.vendorName, row.paidAmount]));
  const payableMap = new Map<string, number>();

  for (const group of project.reconciliationGroups.filter((item) => item.reconciliationStatus === '已對帳')) {
    payableMap.set(group.vendorName, (payableMap.get(group.vendorName) ?? 0) + group.amountTotal);
  }

  return Array.from(payableMap.entries()).map(([vendorName, payableAmount]) => ({
    vendorName,
    payableAmount,
    paidAmount: paidMap.get(vendorName) ?? 0,
  }));
}

export async function getCloseoutArchiveDetailReadModel(projectId: string): Promise<CloseoutArchiveDetailReadModel | null> {
  const archiveProject = await getCloseoutArchiveProjectById(projectId);
  if (!archiveProject) return null;

  const db = createPhase1DbClient();
  const hasQuotationImportTotalAmountColumn = await hasFinancialQuotationImportTotalAmountColumn().catch(() => false);
  const [collectionRows, paymentRows, summaryRowResult] = await Promise.all([
    db.query<CloseoutArchiveCollectionRecord>(`
      select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
      from project_collection_records
      where project_id = $1
      order by collected_on desc, created_at desc
    `, [projectId]),
    db.query<{ vendorName: string; paidAmount: number }>(`
      select vendor_name as "vendorName", sum(amount)::float8 as "paidAmount"
      from project_vendor_payment_records
      where project_id = $1
      group by vendor_name
      order by vendor_name asc
    `, [projectId]),
    db.query<{ quotationTotal: number; projectCostTotal: number; grossProfit: number }>(`
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
        where lc.project_id = $1
        group by lc.project_id
      ),
      manual_costs as (
        select
          project_id,
          coalesce(sum(amount) filter (where included_in_cost = true), 0)::float8 as total
        from financial_manual_costs
        where project_id = $1
        group by project_id
      ),
      quotation_totals as (
        select
          fqi.project_id,
          coalesce(${hasQuotationImportTotalAmountColumn ? 'fqi.total_amount' : 'sum(fqli.quantity * fqli.unit_price)'}, 0)::float8 as total
        from financial_quotation_imports fqi
        ${hasQuotationImportTotalAmountColumn ? '' : 'inner join financial_quotation_line_items fqli on fqli.quotation_import_id = fqi.id'}
        where fqi.project_id = $1 and fqi.is_active = true
        ${hasQuotationImportTotalAmountColumn ? '' : 'group by fqi.project_id'}
      )
      select
        coalesce(qt.total, 0)::float8 as "quotationTotal",
        (coalesce(cc.total, 0) + coalesce(mc.total, 0))::float8 as "projectCostTotal",
        (coalesce(qt.total, 0) - (coalesce(cc.total, 0) + coalesce(mc.total, 0)))::float8 as "grossProfit"
      from (select $1::uuid as project_id) base
      left join quotation_totals qt on qt.project_id = base.project_id
      left join confirmation_costs cc on cc.project_id = base.project_id
      left join manual_costs mc on mc.project_id = base.project_id
    `, [projectId]),
  ]);

  const summaryTotals = summaryRowResult.rows[0] ?? {
    quotationTotal: 0,
    projectCostTotal: 0,
    grossProfit: 0,
  };

  return {
    archiveProject,
    archiveCollections: collectionRows.rows,
    archiveVendorPayments: buildArchiveVendorPaymentRows(archiveProject, paymentRows.rows),
    summaryTotals,
  };
}
