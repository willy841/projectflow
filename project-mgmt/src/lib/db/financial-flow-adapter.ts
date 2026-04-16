import {
  type CostLineItem,
  type CostSourceType,
  type QuoteCostProject,
} from '@/components/quote-cost-data';
import { quoteCostProjectFixtures } from '@/components/quote-cost-fixtures';

const TRACE_PROJECT_ID = '11111111-1111-4111-8111-111111111111';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { shouldUseDbDesignFlow } from '@/lib/db/design-flow-toggle';
import { shouldUseDbProcurementFlow } from '@/lib/db/procurement-flow-toggle';
import { shouldUseDbVendorFlow } from '@/lib/db/vendor-flow-toggle';
import { loadQuotationReadModelIndex, type QuotationReadModel } from '@/lib/db/quotation-read-model';

type DbFinancialProjectIdentity = {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  projectStatus: '執行中' | '已結案';
  latestFinancialActivityAt: string;
};

function normalizeProjectName(value: string) {
  return value.replace(/\s+/g, '').trim().toLowerCase();
}

function logQuoteCostTrace(stage: string, payload: Record<string, unknown>) {
  console.info(`[quote-costs][trace] ${stage}`, payload);
}

function mergeDbAndSeedCostItems(seedProject: QuoteCostProject | undefined, dbItems: CostLineItem[]) {
  if (!seedProject) return dbItems;

  const dbSourceTypes = new Set(dbItems.map((dbItem) => dbItem.sourceType));
  const fallbackSeedCostItems = seedProject.costItems.filter((item) => !dbSourceTypes.has(item.sourceType));

  return [...fallbackSeedCostItems, ...dbItems];
}

function buildFinancialProjectNote({
  quotationReadModel,
  hasSeedCostFallback,
}: {
  quotationReadModel: QuotationReadModel;
  hasSeedCostFallback: boolean;
}) {
  const notes = ['正式 Financial project source'];

  if (quotationReadModel.status === 'missing-schema-seed-fallback') {
    notes.push('quotation 正式 DB schema/read model 尚未存在，暫由 quotation fallback 承接');
  } else if (quotationReadModel.status === 'query-failed-seed-fallback') {
    notes.push('quotation DB readback 失敗，暫回退 quotation fallback');
  }

  if (hasSeedCostFallback) {
    notes.push('僅保留 DB 尚未接管的成本來源作過渡 fallback');
  }

  return `${notes.join('；')}。`;
}

function buildMergedFinancialProject({
  dbProject,
  matchedSeed,
  quotationReadModel,
  dbItems,
  reconciliationStatus,
}: {
  dbProject: DbFinancialProjectIdentity;
  matchedSeed?: QuoteCostProject;
  quotationReadModel: QuotationReadModel;
  dbItems: CostLineItem[];
  reconciliationStatus: QuoteCostProject['reconciliationStatus'];
}): QuoteCostProject {
  const mergedCostItems = mergeDbAndSeedCostItems(matchedSeed, dbItems);
  const hasSeedCostFallback = Boolean(matchedSeed) && mergedCostItems.length > dbItems.length;

  return {
    id: dbProject.id,
    projectCode: matchedSeed?.projectCode ?? dbProject.projectCode,
    projectName: dbProject.projectName,
    clientName: matchedSeed?.clientName ?? dbProject.clientName,
    eventDate: dbProject.eventDate,
    projectStatus: dbProject.projectStatus,
    quotationImported: quotationReadModel.quotationImported,
    quotationImport: quotationReadModel.quotationImport,
    reconciliationStatus,
    closeStatus: dbProject.projectStatus === '已結案' ? '已結案' : '未結案',
    quotationItems: quotationReadModel.quotationItems,
    costItems: mergedCostItems,
    note: buildFinancialProjectNote({
      quotationReadModel,
      hasSeedCostFallback,
    }),
  };
}

async function loadFinancialItemsSafely<T>(
  label: 'design' | 'procurement' | 'vendor' | 'manual' | 'reconciliation',
  loader: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(`[quote-costs][trace] ${label}-items-load-failed`, {
      traceProjectId: TRACE_PROJECT_ID,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
}

async function listDbFinancialProjects(): Promise<DbFinancialProjectIdentity[]> {
  const db = createPhase1DbClient();
  const manualCostsTableExists = await hasFinancialManualCostsTable();
  const manualProjectSourceSql = manualCostsTableExists
    ? `
      union all

      select
        fmc.project_id,
        null::timestamp as latest_confirmation_at,
        null::timestamp as latest_plan_cost_at,
        max(coalesce(fmc.updated_at, fmc.created_at)) as latest_manual_cost_at
      from financial_manual_costs fmc
      group by fmc.project_id
    `
    : '';
  const rows = await db.query<DbFinancialProjectIdentity>(`
    ${CANONICAL_CONFIRMATIONS_CTE},
    active_financial_projects as (
      select
        tc.project_id,
        max(tc.confirmed_at) as latest_confirmation_at,
        null::timestamp as latest_plan_cost_at,
        null::timestamp as latest_manual_cost_at
      from latest_task_confirmations tc
      group by tc.project_id
      ${manualProjectSourceSql}
    ),
    summarized_financial_projects as (
      select
        project_id,
        max(latest_confirmation_at) as latest_confirmation_at,
        max(latest_plan_cost_at) as latest_plan_cost_at,
        max(latest_manual_cost_at) as latest_manual_cost_at
      from active_financial_projects
      group by project_id
    )
    select
      p.id,
      coalesce(p.code, '-') as "projectCode",
      p.name as "projectName",
      coalesce(p.client_name, '未填寫') as "clientName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      case
        when coalesce(p.status, '') in ('已結案', '結案') then '已結案'
        else '執行中'
      end as "projectStatus",
      coalesce(
        greatest(
          coalesce(sfp.latest_confirmation_at, '-infinity'::timestamp),
          coalesce(sfp.latest_plan_cost_at, '-infinity'::timestamp),
          coalesce(sfp.latest_manual_cost_at, '-infinity'::timestamp)
        )::text,
        p.created_at::text
      ) as "latestFinancialActivityAt"
    from projects p
    left join summarized_financial_projects sfp on sfp.project_id = p.id
    order by
      coalesce(
        greatest(
          coalesce(sfp.latest_confirmation_at, '-infinity'::timestamp),
          coalesce(sfp.latest_plan_cost_at, '-infinity'::timestamp),
          coalesce(sfp.latest_manual_cost_at, '-infinity'::timestamp)
        ),
        p.created_at
      ) desc,
      p.event_date desc nulls last,
      p.created_at desc
  `);

  return rows.rows;
}

function hasDbConnectionString() {
  return Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING,
  );
}

type SnapshotAmountRow = {
  projectId: string;
  taskId: string;
  snapshotId: string;
  title: string | null;
  amount: number | null;
  vendorName: string | null;
};

type TableExistsRow = {
  exists: boolean;
};

type ColumnExistsRow = {
  exists: boolean;
};

type ManualCostRow = {
  id: string;
  projectId: string;
  itemName: string | null;
  description: string | null;
  amount: number | null;
  includedInCost: boolean;
};

type ReconciliationGroupStatusRow = {
  projectId: string;
  reconciledCount: number;
  totalCount: number;
};

const CANONICAL_CONFIRMATIONS_CTE = `
  with canonical_task_confirmations as (
    select
      tc.id,
      tc.flow_type,
      coalesce(dt.project_id, pt.project_id, vt.project_id, tc.project_id) as project_id,
      tc.task_id,
      coalesce(
        tc.task_id::text,
        concat('__project__:', coalesce(dt.project_id, pt.project_id, vt.project_id, tc.project_id)::text)
      ) as confirmation_partition_key,
      tc.confirmation_no,
      tc.confirmed_at,
      tc.created_at
    from task_confirmations tc
    left join design_tasks dt
      on tc.flow_type = 'design'
     and dt.id = tc.task_id
    left join procurement_tasks pt
      on tc.flow_type = 'procurement'
     and pt.id = tc.task_id
    left join vendor_tasks vt
      on tc.flow_type = 'vendor'
     and vt.id = tc.task_id
    where tc.flow_type in ('design', 'procurement', 'vendor')
  ),
  latest_task_confirmations as (
    select distinct on (tc.flow_type, tc.confirmation_partition_key)
      tc.id,
      tc.flow_type,
      tc.project_id,
      tc.task_id,
      tc.confirmation_no,
      tc.confirmed_at,
      tc.created_at
    from canonical_task_confirmations tc
    order by tc.flow_type, tc.confirmation_partition_key, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
  )
`;

async function hasFinancialManualCostsTable() {
  const db = createPhase1DbClient();
  const rows = await db.query<TableExistsRow>(`
    select to_regclass('public.financial_manual_costs') is not null as exists
  `);

  return rows.rows[0]?.exists ?? false;
}

async function hasFinancialManualCostsIncludedInCostColumn() {
  const db = createPhase1DbClient();
  const rows = await db.query<ColumnExistsRow>(`
    select exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'financial_manual_costs'
        and column_name = 'included_in_cost'
    ) as exists
  `);

  return rows.rows[0]?.exists ?? false;
}

async function hasFinancialReconciliationGroupsTable() {
  const db = createPhase1DbClient();
  const rows = await db.query<TableExistsRow>(`
    select to_regclass('public.financial_reconciliation_groups') is not null as exists
  `);

  return rows.rows[0]?.exists ?? false;
}

function summarizeProjectReconciliationStatus(row?: ReconciliationGroupStatusRow): QuoteCostProject['reconciliationStatus'] {
  if (!row || row.totalCount <= 0) return '未開始';
  if (row.reconciledCount <= 0) return '未開始';
  if (row.reconciledCount >= row.totalCount) return '已完成';
  return '待確認';
}

async function loadProjectReconciliationStatusIndex(projectIds: string[]) {
  const result = new Map<string, QuoteCostProject['reconciliationStatus']>();

  if (!projectIds.length) return result;
  if (!(await hasFinancialReconciliationGroupsTable())) return result;

  const db = createPhase1DbClient();
  const rows = await db.query<ReconciliationGroupStatusRow>(`
    select
      project_id as "projectId",
      count(*)::int as "totalCount",
      count(*) filter (where reconciliation_status = '已對帳')::int as "reconciledCount"
    from financial_reconciliation_groups
    where project_id = any($1::uuid[])
    group by project_id
  `, [projectIds]);

  for (const row of rows.rows) {
    result.set(row.projectId, summarizeProjectReconciliationStatus(row));
  }

  return result;
}

async function listDesignFinancialItems(): Promise<CostLineItem[]> {
  if (!shouldUseDbDesignFlow()) return [];
  const db = createPhase1DbClient();
  const rows = await db.query<SnapshotAmountRow>(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名設計項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      nullif(ts.payload_json->>'vendor_name_text', '') as "vendorName"
    from latest_task_confirmations tc
    inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
    where tc.flow_type = 'design'
    order by tc.confirmed_at desc, ts.sort_order asc, ts.created_at asc
  `);

  return rows.rows.map((row) => ({
    id: `db-design-${row.snapshotId}`,
    itemName: row.title ?? '未命名設計項目',
    sourceType: '設計',
    sourceRef: `設計正式確認 / ${row.taskId}`,
    vendorId: null,
    vendorName: row.vendorName,
    originalAmount: Number(row.amount ?? 0),
    adjustedAmount: Number(row.amount ?? 0),
    includedInCost: true,
    isManual: false,
  }));
}

async function listProcurementFinancialItems(): Promise<CostLineItem[]> {
  if (!shouldUseDbProcurementFlow()) return [];
  const db = createPhase1DbClient();
  const rows = await db.query<SnapshotAmountRow>(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名備品項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      nullif(ts.payload_json->>'vendor_name_text', '') as "vendorName"
    from latest_task_confirmations tc
    inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
    where tc.flow_type = 'procurement'
    order by tc.confirmed_at desc, ts.sort_order asc, ts.created_at asc
  `);

  return rows.rows.map((row) => ({
    id: `db-procurement-${row.snapshotId}`,
    itemName: row.title ?? '未命名備品項目',
    sourceType: '備品',
    sourceRef: `備品正式確認 / ${row.taskId}`,
    vendorId: null,
    vendorName: row.vendorName,
    originalAmount: Number(row.amount ?? 0),
    adjustedAmount: Number(row.amount ?? 0),
    includedInCost: true,
    isManual: false,
  }));
}

async function listVendorFinancialItems(): Promise<CostLineItem[]> {
  if (!shouldUseDbVendorFlow()) return [];
  const db = createPhase1DbClient();
  const rows = await db.query<SnapshotAmountRow>(`
    ${CANONICAL_CONFIRMATIONS_CTE}
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名廠商項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      v.name as "vendorName"
    from latest_task_confirmations tc
    inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
    inner join vendor_tasks vt on vt.id = tc.task_id
    inner join vendors v on v.id = vt.vendor_id
    where tc.flow_type = 'vendor'
    order by tc.confirmed_at desc, ts.sort_order asc, ts.created_at asc
  `);

  return rows.rows.map((row) => ({
    id: `db-vendor-${row.snapshotId}`,
    itemName: row.title ?? '未命名廠商項目',
    sourceType: '廠商',
    sourceRef: `廠商正式確認 / ${row.vendorName ?? row.taskId}`,
    vendorId: null,
    vendorName: row.vendorName,
    originalAmount: Number(row.amount ?? 0),
    adjustedAmount: Number(row.amount ?? 0),
    includedInCost: true,
    isManual: false,
  }));
}

async function listManualFinancialItems(): Promise<Array<{ projectId: string; item: CostLineItem }>> {
  if (!(await hasFinancialManualCostsTable())) {
    return [];
  }

  const hasIncludedInCostColumn = await hasFinancialManualCostsIncludedInCostColumn();
  const db = createPhase1DbClient();
  const rows = await db.query<ManualCostRow>(`
    select
      id,
      project_id as "projectId",
      item_name as "itemName",
      description,
      amount,
      ${hasIncludedInCostColumn ? 'included_in_cost' : 'true'} as "includedInCost"
    from financial_manual_costs
    order by project_id asc, sort_order asc, created_at asc
  `);

  return rows.rows.map((row) => ({
    projectId: row.projectId,
    item: {
      id: `db-manual-${row.id}`,
      itemName: row.itemName ?? '未命名人工成本',
      sourceType: '人工',
      sourceRef: row.description ?? '',
      vendorId: null,
      vendorName: null,
      originalAmount: Number(row.amount ?? 0),
      adjustedAmount: Number(row.amount ?? 0),
      includedInCost: row.includedInCost,
      isManual: true,
    },
  }));
}

export async function getQuoteCostProjectsWithDbFinancials(): Promise<QuoteCostProject[]> {
  if (!hasDbConnectionString()) {
    logQuoteCostTrace('adapter-no-db-connection-string', {
      traceProjectId: TRACE_PROJECT_ID,
    });
    return quoteCostProjectFixtures;
  }

  try {
    const dbProjects = await listDbFinancialProjects();
    const traceDbProject = dbProjects.find((project) => project.id === TRACE_PROJECT_ID) ?? null;

    logQuoteCostTrace('adapter-db-project-source', {
      traceProjectId: TRACE_PROJECT_ID,
      projectCount: dbProjects.length,
      present: Boolean(traceDbProject),
      projectName: traceDbProject?.projectName ?? null,
      projectStatus: traceDbProject?.projectStatus ?? null,
    });

    const [designItems, procurementItems, vendorItems, manualItems, quotationReadModelIndex, reconciliationStatusIndex] = await Promise.all([
      loadFinancialItemsSafely('design', listDesignFinancialItems, [] as CostLineItem[]),
      loadFinancialItemsSafely('procurement', listProcurementFinancialItems, [] as CostLineItem[]),
      loadFinancialItemsSafely('vendor', listVendorFinancialItems, [] as CostLineItem[]),
      loadFinancialItemsSafely('manual', listManualFinancialItems, [] as Array<{ projectId: string; item: CostLineItem }>),
      loadQuotationReadModelIndex(dbProjects.map((project) => project.id)),
      loadFinancialItemsSafely('reconciliation', () => loadProjectReconciliationStatusIndex(dbProjects.map((project) => project.id)), new Map<string, QuoteCostProject['reconciliationStatus']>()),
    ]);

    const byProject = new Map<string, CostLineItem[]>();

    // project mapping via snapshot id keeps the item shape aligned with existing Financial views.
    const db = createPhase1DbClient();
    const projectSnapshotRows = await db.query<{
      projectId: string;
      snapshotId: string;
      flowType: 'design' | 'procurement' | 'vendor';
    }>(`
      ${CANONICAL_CONFIRMATIONS_CTE}
      select tc.project_id as "projectId", ts.id as "snapshotId", tc.flow_type as "flowType"
      from latest_task_confirmations tc
      inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
      where tc.flow_type in ('design', 'procurement', 'vendor')
    `);

    const snapshotToProject = new Map<string, string>();
    for (const row of projectSnapshotRows.rows) {
      snapshotToProject.set(row.snapshotId, row.projectId);
    }

    const allDbItems = [...designItems, ...procurementItems, ...vendorItems];

    logQuoteCostTrace('adapter-item-source-summary', {
      traceProjectId: TRACE_PROJECT_ID,
      designItemCount: designItems.length,
      procurementItemCount: procurementItems.length,
      vendorItemCount: vendorItems.length,
      manualItemCount: manualItems.length,
    });
    for (const item of allDbItems) {
      const snapshotId = item.id.replace(/^db-(design|procurement|vendor)-/, '');
      const projectId = snapshotToProject.get(snapshotId);
      if (!projectId) continue;
      if (!byProject.has(projectId)) byProject.set(projectId, []);
      byProject.get(projectId)?.push(item);
    }

    for (const manualEntry of manualItems) {
      if (!byProject.has(manualEntry.projectId)) byProject.set(manualEntry.projectId, []);
      byProject.get(manualEntry.projectId)?.push(manualEntry.item);
    }

    const seedById = new Map(quoteCostProjectFixtures.map((project) => [project.id, project]));
    const seedByName = new Map(quoteCostProjectFixtures.map((project) => [normalizeProjectName(project.projectName), project]));

    if (!dbProjects.length) {
      logQuoteCostTrace('adapter-db-project-source-empty', {
        traceProjectId: TRACE_PROJECT_ID,
      });
      return quoteCostProjectFixtures;
    }

    const mergedProjects = dbProjects.map((dbProject) => {
      const matchedSeed = seedById.get(dbProject.id) ?? seedByName.get(normalizeProjectName(dbProject.projectName));
      const dbItems = byProject.get(dbProject.id) ?? [];
      const quotationReadModel = quotationReadModelIndex.get(dbProject.id) ?? {
        quotationImported: matchedSeed?.quotationImported ?? false,
        quotationImport: matchedSeed?.quotationImport ?? null,
        quotationItems: matchedSeed?.quotationItems ?? [],
        status: 'missing-schema-seed-fallback' as const,
      };

      return buildMergedFinancialProject({
        dbProject,
        matchedSeed,
        quotationReadModel,
        dbItems,
        reconciliationStatus: reconciliationStatusIndex.get(dbProject.id) ?? '未開始',
      });
    });

    const tracedMergedProject = mergedProjects.find((project) => project.id === TRACE_PROJECT_ID) ?? null;
    logQuoteCostTrace('adapter-merged-projects', {
      traceProjectId: TRACE_PROJECT_ID,
      projectCount: mergedProjects.length,
      present: Boolean(tracedMergedProject),
      projectStatus: tracedMergedProject?.projectStatus ?? null,
      costItemsCount: tracedMergedProject?.costItems.length ?? 0,
      costSourceTypes: tracedMergedProject ? [...new Set(tracedMergedProject.costItems.map((item) => item.sourceType))] : [],
    });

    return mergedProjects;
  } catch (error) {
    console.error('[quote-costs][trace] adapter-fell-back-to-seed', {
      traceProjectId: TRACE_PROJECT_ID,
      error: error instanceof Error ? error.message : String(error),
    });
    return quoteCostProjectFixtures;
  }
}

export type FinancialReconciliationGroup = {
  key: string;
  sourceType: Exclude<CostSourceType, '人工'>;
  vendorName: string;
  amountTotal: number;
  itemCount: number;
  items: CostLineItem[];
  reconciliationStatus: '未對帳' | '已對帳';
};

export type QuoteCostProjectWithGroups = QuoteCostProject & {
  reconciliationGroups: FinancialReconciliationGroup[];
};

function buildFinancialGroupKey(projectId: string, sourceType: Exclude<CostSourceType, '人工'>, vendorName: string) {
  return `${projectId}::${sourceType}::${vendorName}`;
}

async function attachReconciliationGroups(project: QuoteCostProject): Promise<QuoteCostProjectWithGroups> {
  const groupMap = new Map<string, FinancialReconciliationGroup>();

  project.costItems
    .filter((item): item is CostLineItem & { sourceType: Exclude<CostSourceType, '人工'> } => item.sourceType !== '人工')
    .filter((item) => item.vendorName && item.includedInCost)
    .forEach((item) => {
      const vendorName = item.vendorName as string;
      const key = buildFinancialGroupKey(project.id, item.sourceType, vendorName);
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
        vendorName,
        amountTotal: item.adjustedAmount,
        itemCount: 1,
        items: [item],
        reconciliationStatus: '未對帳',
      });
    });

  const db = createPhase1DbClient();
  const rows = await db.query<{
    sourceType: '設計' | '備品' | '廠商';
    vendorName: string;
    reconciliationStatus: '未對帳' | '已對帳';
  }>(
    `
      select
        source_type as "sourceType",
        vendor_name as "vendorName",
        reconciliation_status as "reconciliationStatus"
      from financial_reconciliation_groups
      where project_id = $1
    `,
    [project.id],
  );

  for (const row of rows.rows) {
    const key = buildFinancialGroupKey(project.id, row.sourceType, row.vendorName);
    const existing = groupMap.get(key);
    if (existing) {
      existing.reconciliationStatus = row.reconciliationStatus;
      continue;
    }
    groupMap.set(key, {
      key,
      sourceType: row.sourceType,
      vendorName: row.vendorName,
      amountTotal: 0,
      itemCount: 0,
      items: [],
      reconciliationStatus: row.reconciliationStatus,
    });
  }

  return {
    ...project,
    reconciliationGroups: Array.from(groupMap.values()),
  };
}

export async function getQuoteCostProjectsWithDbFinancialsAndGroups(): Promise<QuoteCostProjectWithGroups[]> {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  return Promise.all(projects.map(attachReconciliationGroups));
}

export async function getQuoteCostProjectByIdWithDbFinancials(projectId: string): Promise<QuoteCostProjectWithGroups | null> {
  const projects = await getQuoteCostProjectsWithDbFinancialsAndGroups();
  return projects.find((project) => project.id === projectId) ?? null;
}
