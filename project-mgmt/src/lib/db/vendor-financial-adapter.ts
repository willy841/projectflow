import { createPhase1DbClient } from '@/lib/db/phase1-client';
import type { CostLineItem } from '@/components/quote-cost-data';

export type VendorFinancialSummary = {
  unpaidTotal: number;
  records: Array<{
    projectId: string;
    vendorId: string | null;
    projectName: string;
    projectStatus: '執行中' | '已結案';
    reconciliationStatus: string;
    adjustedCost: number;
    adjustedCostLabel: string;
    costItems: CostLineItem[];
    reconciledGroups: Array<{
      sourceType: '設計' | '備品' | '廠商';
      vendorName: string;
      amountTotal: number;
      itemCount: number;
    }>;
    hasUnreconciledGroups: boolean;
  }>;
};

function normalizeVendorName(value: string) {
  return value.trim();
}

type VendorGroupRow = {
  projectId: string;
  projectName: string;
  projectStatus: '執行中' | '已結案';
  sourceType: '設計' | '備品' | '廠商';
  vendorId: string | null;
  vendorName: string;
  amountTotal: number;
  itemCount: number;
  reconciliationStatus: string;
};

type VendorCostItemRow = {
  projectId: string;
  sourceType: '設計' | '備品' | '廠商';
  itemName: string;
  sourceRef: string;
  vendorId: string | null;
  vendorName: string;
  adjustedAmount: number;
};

export async function getVendorFinancialSummary({ vendorId, vendorName }: { vendorId?: string; vendorName: string }): Promise<VendorFinancialSummary> {
  try {
    const db = createPhase1DbClient();
    const normalizedVendorName = normalizeVendorName(vendorName);

    const groupRowsResult = await db.query<VendorGroupRow>(`
      select
        frg.project_id as "projectId",
        p.name as "projectName",
        case when coalesce(p.status, '') in ('已結案', '結案') then '已結案' else '執行中' end as "projectStatus",
        frg.source_type as "sourceType",
        frg.vendor_id as "vendorId",
        coalesce(v.name, frg.vendor_name) as "vendorName",
        frg.amount_total::float8 as "amountTotal",
        frg.item_count::int as "itemCount",
        frg.reconciliation_status as "reconciliationStatus"
      from financial_reconciliation_groups frg
      inner join projects p on p.id = frg.project_id
      left join vendors v on v.id = frg.vendor_id
      where (
        ($1::uuid is not null and frg.vendor_id = $1::uuid)
        or lower(trim(coalesce(v.name, frg.vendor_name))) = lower($2)
      )
      order by p.event_date desc nulls last, p.created_at desc, frg.source_type asc, frg.vendor_name asc
    `, [vendorId ?? null, normalizedVendorName]);

    const groupRows = groupRowsResult.rows;
    if (!groupRows.length) {
      return { unpaidTotal: 0, records: [] };
    }

    const projectIds = Array.from(new Set(groupRows.map((row) => row.projectId)));

    const costItemsResult = await db.query<VendorCostItemRow>(`
      select
        fci.project_id as "projectId",
        fci.source_type as "sourceType",
        fci.item_name as "itemName",
        coalesce(fci.source_ref, '') as "sourceRef",
        fci.vendor_id as "vendorId",
        coalesce(v.name, fci.vendor_name) as "vendorName",
        fci.adjusted_amount::float8 as "adjustedAmount"
      from financial_cost_items fci
      left join vendors v on v.id = fci.vendor_id
      where fci.project_id = any($1::uuid[])
        and (
          ($2::uuid is not null and fci.vendor_id = $2::uuid)
          or lower(trim(coalesce(v.name, fci.vendor_name))) = lower($3)
        )
      order by fci.project_id asc, fci.source_type asc, fci.created_at asc, fci.id asc
    `, [projectIds, vendorId ?? null, normalizedVendorName]);

    const costItemsByProjectId = new Map<string, CostLineItem[]>();
    for (const row of costItemsResult.rows) {
      const current = costItemsByProjectId.get(row.projectId) ?? [];
      current.push({
        id: `financial-cost-${row.projectId}-${row.sourceType}-${current.length + 1}`,
        itemName: row.itemName,
        sourceType: row.sourceType,
        sourceRef: row.sourceRef,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        originalAmount: row.adjustedAmount,
        adjustedAmount: row.adjustedAmount,
        includedInCost: true,
        isManual: false,
      });
      costItemsByProjectId.set(row.projectId, current);
    }

    const groupedByProject = new Map<string, VendorGroupRow[]>();
    for (const row of groupRows) {
      const current = groupedByProject.get(row.projectId) ?? [];
      current.push(row);
      groupedByProject.set(row.projectId, current);
    }

    const records = Array.from(groupedByProject.entries()).map(([projectId, rows]) => {
      const projectName = rows[0]?.projectName ?? '未命名專案';
      const projectStatus = rows[0]?.projectStatus ?? '執行中';
      const reconciledGroups = rows
        .filter((row) => row.reconciliationStatus === '已對帳')
        .map((row) => ({
          sourceType: row.sourceType,
          vendorName: row.vendorName,
          amountTotal: row.amountTotal,
          itemCount: row.itemCount,
        }));
      const hasUnreconciledGroups = rows.some((row) => row.reconciliationStatus !== '已對帳');
      const adjustedCost = reconciledGroups.reduce((sum, row) => sum + row.amountTotal, 0);
      const reconciliationStatus = reconciledGroups.length > 0 ? '已完成' : '未開始';
      return {
        projectId,
        vendorId: vendorId ?? null,
        projectName,
        projectStatus,
        reconciliationStatus,
        adjustedCost,
        adjustedCostLabel: `NT$ ${adjustedCost.toLocaleString('zh-TW')}`,
        costItems: costItemsByProjectId.get(projectId) ?? [],
        reconciledGroups,
        hasUnreconciledGroups,
      };
    }).filter((record) => record.reconciledGroups.length > 0);

    return {
      unpaidTotal: records.reduce((sum, record) => sum + record.adjustedCost, 0),
      records,
    };
  } catch {
    return {
      unpaidTotal: 0,
      records: [],
    };
  }
}
