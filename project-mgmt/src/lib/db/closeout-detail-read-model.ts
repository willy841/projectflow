import { getCloseoutArchiveProjectById } from '@/lib/db/closeout-archive-source';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { hasFinancialQuotationImportTotalAmountColumn } from '@/lib/db/quotation-schema';
import type { CostLineItem } from '@/components/quote-cost-data';
import type { QuoteCostProjectWithGroups } from '@/lib/db/financial-flow-adapter';

export type CloseoutArchiveCollectionRecord = {
  id: string;
  collectedOn: string;
  amount: number;
  note: string;
};

export type CloseoutArchiveVendorPaymentRecord = {
  vendorName: string;
  reconciledCount: number;
  unreconciledCount: number;
  payableAmount: number;
};

type RetainedReconciliationGroup = QuoteCostProjectWithGroups['reconciliationGroups'][number];

type CloseoutRetainedSnapshotRow = {
  snapshotId: string;
  flowType: 'design' | 'procurement' | 'vendor';
  title: string | null;
  amount: number | null;
  vendorId: string | null;
  vendorName: string | null;
  vendorNameText: string | null;
};

type CloseoutRetainedManualCostRow = {
  id: string;
  itemName: string | null;
  description: string | null;
  amount: number | null;
  includedInCost: boolean;
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

function buildRetainedGroupKey(projectId: string, sourceType: '設計' | '備品' | '廠商', vendorId: string | null, vendorName: string) {
  return `${projectId}::${sourceType}::${vendorId ?? `name:${vendorName}`}`;
}

function buildRetainedSnapshotCostItem(projectId: string, row: CloseoutRetainedSnapshotRow): CostLineItem {
  const sourceType = row.flowType === 'design' ? '設計' : row.flowType === 'procurement' ? '備品' : '廠商';
  const vendorName = row.flowType === 'vendor'
    ? row.vendorName
    : row.vendorName ?? row.vendorNameText ?? null;

  return {
    id: `closeout-${row.flowType}-${row.snapshotId}`,
    itemName:
      row.title
      ?? (row.flowType === 'design'
        ? '未命名設計項目'
        : row.flowType === 'procurement'
          ? '未命名備品項目'
          : '未命名廠商項目'),
    sourceType,
    sourceRef:
      row.flowType === 'design'
        ? '設計最終流程內容'
        : row.flowType === 'procurement'
          ? '備品最終流程內容'
          : `廠商正式確認 / ${vendorName ?? '未指定廠商'}`,
    vendorId: row.flowType === 'vendor' ? row.vendorId : (row.vendorId ?? null),
    vendorName,
    originalAmount: Number(row.amount ?? 0),
    adjustedAmount: Number(row.amount ?? 0),
    includedInCost: true,
    isManual: false,
  };
}

function buildRetainedManualCostItem(row: CloseoutRetainedManualCostRow): CostLineItem {
  return {
    id: `closeout-manual-${row.id}`,
    itemName: row.itemName ?? '未命名人工成本',
    sourceType: '人工',
    sourceRef: row.description ?? '',
    vendorId: null,
    vendorName: null,
    originalAmount: Number(row.amount ?? 0),
    adjustedAmount: Number(row.amount ?? 0),
    includedInCost: row.includedInCost,
    isManual: true,
  };
}

function buildRetainedReconciliationGroups(projectId: string, costItems: CostLineItem[]): RetainedReconciliationGroup[] {
  const groupMap = new Map<string, RetainedReconciliationGroup>();

  costItems
    .filter((item): item is CostLineItem & { sourceType: '設計' | '備品' | '廠商' } => item.sourceType !== '人工')
    .filter((item) => item.includedInCost && item.vendorName)
    .forEach((item) => {
      const vendorName = item.vendorName as string;
      const key = buildRetainedGroupKey(projectId, item.sourceType, item.vendorId, vendorName);
      const existing = groupMap.get(key);
      if (existing) {
        existing.amountTotal += item.adjustedAmount;
        existing.itemCount += 1;
        existing.items.push(item);
        return;
      }

      groupMap.set(key, {
        key,
        sourceType: item.sourceType,
        vendorId: item.vendorId,
        vendorName,
        amountTotal: item.adjustedAmount,
        itemCount: 1,
        items: [item],
        reconciliationStatus: '已對帳',
      });
    });

  return Array.from(groupMap.values());
}

function buildArchiveVendorPaymentRows(reconciliationGroups: RetainedReconciliationGroup[]): CloseoutArchiveVendorPaymentRecord[] {
  const vendorGroupMap = new Map<string, { reconciledCount: number; unreconciledCount: number; payableAmount: number }>();

  for (const group of reconciliationGroups) {
    const current = vendorGroupMap.get(group.vendorName) ?? { reconciledCount: 0, unreconciledCount: 0, payableAmount: 0 };
    if (group.reconciliationStatus === '已對帳') {
      current.reconciledCount += 1;
      current.payableAmount += group.amountTotal;
    } else {
      current.unreconciledCount += 1;
    }
    vendorGroupMap.set(group.vendorName, current);
  }

  return Array.from(vendorGroupMap.entries()).map(([vendorName, summary]) => ({
    vendorName,
    reconciledCount: summary.reconciledCount,
    unreconciledCount: summary.unreconciledCount,
    payableAmount: summary.payableAmount,
  }));
}

export async function getCloseoutArchiveDetailReadModel(projectId: string): Promise<CloseoutArchiveDetailReadModel | null> {
  const archiveProject = await getCloseoutArchiveProjectById(projectId);
  if (!archiveProject) return null;

  const db = createPhase1DbClient();
  const hasQuotationImportTotalAmountColumn = await hasFinancialQuotationImportTotalAmountColumn().catch(() => false);
  const [collectionRows, summaryRowResult, retainedSnapshotRows, manualCostRows] = await Promise.all([
    db.query<CloseoutArchiveCollectionRecord>(`
      select id, to_char(collected_on, 'YYYY-MM-DD') as "collectedOn", amount::float8 as amount, coalesce(note, '') as note
      from project_collection_records
      where project_id = $1
      order by collected_on desc, created_at desc
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
    db.query<CloseoutRetainedSnapshotRow>(`
      with latest_confirmations as (
        select distinct on (tc.project_id, tc.flow_type, tc.task_id)
          tc.project_id,
          tc.flow_type,
          tc.task_id,
          tc.id,
          tc.confirmed_at
        from task_confirmations tc
        where tc.project_id = $1
          and tc.status = 'confirmed'
        order by tc.project_id, tc.flow_type, tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc
      )
      select
        ts.id as "snapshotId",
        lc.flow_type as "flowType",
        coalesce(ts.payload_json->>'title', null) as title,
        nullif(ts.payload_json->>'amount', '')::float8 as amount,
        case
          when lc.flow_type = 'vendor' then vt.vendor_id
          else nullif(ts.payload_json->>'vendor_id', '')::uuid
        end as "vendorId",
        case
          when lc.flow_type = 'vendor' then v.name
          else coalesce(v.name, nullif(ts.payload_json->>'vendor_name_text', ''))
        end as "vendorName",
        nullif(ts.payload_json->>'vendor_name_text', '') as "vendorNameText"
      from latest_confirmations lc
      inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = lc.id
      left join vendor_tasks vt on lc.flow_type = 'vendor' and vt.id = lc.task_id
      left join vendors v on v.id = case
        when lc.flow_type = 'vendor' then vt.vendor_id
        else nullif(ts.payload_json->>'vendor_id', '')::uuid
      end
      order by lc.confirmed_at desc, ts.sort_order asc, ts.created_at asc
    `, [projectId]),
    db.query<CloseoutRetainedManualCostRow>(`
      select
        id,
        item_name as "itemName",
        description,
        amount::float8 as amount,
        included_in_cost as "includedInCost"
      from financial_manual_costs
      where project_id = $1
      order by sort_order asc, created_at asc
    `, [projectId]),
  ]);

  const retainedCostItems = [
    ...retainedSnapshotRows.rows.map((row) => buildRetainedSnapshotCostItem(projectId, row)),
    ...manualCostRows.rows.map(buildRetainedManualCostItem),
  ];
  const retainedReconciliationGroups = buildRetainedReconciliationGroups(projectId, retainedCostItems);
  const summaryTotals = summaryRowResult.rows[0] ?? {
    quotationTotal: 0,
    projectCostTotal: 0,
    grossProfit: 0,
  };

  return {
    archiveProject: {
      ...archiveProject,
      costItems: retainedCostItems,
      reconciliationGroups: retainedReconciliationGroups,
      reconciliationStatus: retainedReconciliationGroups.length > 0 ? '已完成' : '未開始',
    },
    archiveCollections: collectionRows.rows,
    archiveVendorPayments: buildArchiveVendorPaymentRows(retainedReconciliationGroups),
    summaryTotals,
  };
}
