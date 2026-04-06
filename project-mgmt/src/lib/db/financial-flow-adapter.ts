import {
  quoteCostProjects,
  type CostLineItem,
  type QuoteCostProject,
} from '@/components/quote-cost-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { shouldUseDbDesignFlow } from '@/lib/db/design-flow-toggle';
import { shouldUseDbProcurementFlow } from '@/lib/db/procurement-flow-toggle';
import { shouldUseDbVendorFlow } from '@/lib/db/vendor-flow-toggle';

const EMPTY_QUOTE_PROJECT_FIELDS = {
  quotationImported: false,
  quotationImport: null,
  reconciliationStatus: '未開始' as const,
  closeStatus: '未結案' as const,
  quotationItems: [],
  note: '正式 Financial project source，尚未套用 seed 報價資料。',
};

type DbFinancialProjectIdentity = {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  eventDate: string;
  projectStatus: '執行中' | '已結案';
};

function normalizeProjectName(value: string) {
  return value.replace(/\s+/g, '').trim().toLowerCase();
}

async function listDbFinancialProjects(): Promise<DbFinancialProjectIdentity[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbFinancialProjectIdentity>(`
    with active_financial_projects as (
      select distinct tc.project_id
      from task_confirmations tc
      where tc.flow_type in ('design', 'procurement', 'vendor')
    )
    select
      p.id,
      coalesce(p.code, '-') as "projectCode",
      p.name as "projectName",
      coalesce(p.client_name, '未填寫') as "clientName",
      coalesce(p.event_date::text, '-') as "eventDate",
      case
        when coalesce(p.status, '') in ('已結案', '結案') then '已結案'
        else '執行中'
      end as "projectStatus"
    from projects p
    inner join active_financial_projects afp on afp.project_id = p.id
    order by p.event_date nulls last, p.created_at desc
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

async function listDesignFinancialItems(): Promise<CostLineItem[]> {
  if (!shouldUseDbDesignFlow()) return [];
  const db = createPhase1DbClient();
  const rows = await db.query<SnapshotAmountRow>(`
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名設計項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      nullif(ts.payload_json->>'vendor_name_text', '') as "vendorName"
    from task_confirmations tc
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
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名備品項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      nullif(ts.payload_json->>'vendor_name_text', '') as "vendorName"
    from task_confirmations tc
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
    select
      tc.project_id as "projectId",
      tc.task_id as "taskId",
      ts.id as "snapshotId",
      coalesce(ts.payload_json->>'title', '未命名廠商項目') as title,
      nullif(ts.payload_json->>'amount', '')::numeric as amount,
      v.name as "vendorName"
    from task_confirmations tc
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

export async function getQuoteCostProjectsWithDbFinancials(): Promise<QuoteCostProject[]> {
  if (!hasDbConnectionString()) {
    return quoteCostProjects;
  }

  try {
    const [designItems, procurementItems, vendorItems, dbProjects] = await Promise.all([
      listDesignFinancialItems(),
      listProcurementFinancialItems(),
      listVendorFinancialItems(),
      listDbFinancialProjects(),
    ]);

    const byProject = new Map<string, CostLineItem[]>();

    // project mapping via snapshot id keeps the item shape aligned with existing Financial views.
    const db = createPhase1DbClient();
    const projectSnapshotRows = await db.query<{
      projectId: string;
      snapshotId: string;
      flowType: 'design' | 'procurement' | 'vendor';
    }>(`
      select tc.project_id as "projectId", ts.id as "snapshotId", tc.flow_type as "flowType"
      from task_confirmations tc
      inner join task_confirmation_plan_snapshots ts on ts.task_confirmation_id = tc.id
      where tc.flow_type in ('design', 'procurement', 'vendor')
    `);

    const snapshotToProject = new Map<string, string>();
    for (const row of projectSnapshotRows.rows) {
      snapshotToProject.set(row.snapshotId, row.projectId);
    }

    const allDbItems = [...designItems, ...procurementItems, ...vendorItems];
    for (const item of allDbItems) {
      const snapshotId = item.id.replace(/^db-(design|procurement|vendor)-/, '');
      const projectId = snapshotToProject.get(snapshotId);
      if (!projectId) continue;
      if (!byProject.has(projectId)) byProject.set(projectId, []);
      byProject.get(projectId)?.push(item);
    }

    const seedById = new Map(quoteCostProjects.map((project) => [project.id, project]));
    const seedByName = new Map(quoteCostProjects.map((project) => [normalizeProjectName(project.projectName), project]));

    if (!dbProjects.length) {
      return quoteCostProjects;
    }

    return dbProjects.map((dbProject) => {
      const matchedSeed = seedById.get(dbProject.id) ?? seedByName.get(normalizeProjectName(dbProject.projectName));
      const dbItems = byProject.get(dbProject.id) ?? [];
      const preservedSeedItems = matchedSeed
        ? matchedSeed.costItems.filter((item) => item.isManual || !new Set(dbItems.map((dbItem) => dbItem.sourceType)).has(item.sourceType))
        : [];

      return {
        ...(matchedSeed ?? EMPTY_QUOTE_PROJECT_FIELDS),
        id: dbProject.id,
        projectCode: matchedSeed?.projectCode ?? dbProject.projectCode,
        projectName: dbProject.projectName,
        clientName: matchedSeed?.clientName ?? dbProject.clientName,
        eventDate: dbProject.eventDate,
        projectStatus: dbProject.projectStatus,
        quotationImported: matchedSeed?.quotationImported ?? EMPTY_QUOTE_PROJECT_FIELDS.quotationImported,
        quotationImport: matchedSeed?.quotationImport ?? EMPTY_QUOTE_PROJECT_FIELDS.quotationImport,
        reconciliationStatus: matchedSeed?.reconciliationStatus ?? EMPTY_QUOTE_PROJECT_FIELDS.reconciliationStatus,
        closeStatus:
          dbProject.projectStatus === '已結案'
            ? '已結案'
            : (matchedSeed?.closeStatus ?? EMPTY_QUOTE_PROJECT_FIELDS.closeStatus),
        quotationItems: matchedSeed?.quotationItems ?? EMPTY_QUOTE_PROJECT_FIELDS.quotationItems,
        costItems: [...preservedSeedItems, ...dbItems],
        note: matchedSeed?.note ?? EMPTY_QUOTE_PROJECT_FIELDS.note,
      };
    });
  } catch {
    return quoteCostProjects;
  }
}

export async function getQuoteCostProjectByIdWithDbFinancials(projectId: string): Promise<QuoteCostProject | null> {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  return projects.find((project) => project.id === projectId) ?? null;
}
