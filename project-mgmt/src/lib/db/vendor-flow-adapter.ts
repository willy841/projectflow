import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type DbVendorProjectSummary = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

export type DbVendorTaskSummary = {
  id: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  title: string;
  requirementText: string;
};

export type DbVendorGroupSummary = {
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  taskCount: number;
  representativeTaskId: string;
  taskTitles: string[];
};

export type DbVendorTaskRecord = {
  id: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  title: string;
  requirementText: string;
  status: string;
  plans: Array<{
    id: string;
    title: string;
    requirement: string;
    amount: string;
  }>;
  documentRows: Array<{
    id: number;
    item: string;
    quantity: string;
  }>;
};

export type DbVendorGroupDetail = {
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  tasks: DbVendorTaskRecord[];
};

export async function listDbVendorProjects(): Promise<DbVendorProjectSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbVendorProjectSummary>(`
    select
      p.id as "projectId",
      p.name as "projectName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      count(vt.id)::int as "taskCount"
    from vendor_tasks vt
    inner join projects p on p.id = vt.project_id
    group by p.id, p.name, p.event_date
    order by p.event_date nulls last, p.created_at desc
  `);
  return rows.rows;
}

export async function listDbVendorTasksByProject(projectId: string): Promise<DbVendorTaskSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbVendorTaskSummary>(
    `
      select
        vt.id,
        vt.project_id as "projectId",
        p.name as "projectName",
        vt.vendor_id as "vendorId",
        v.name as "vendorName",
        vt.title,
        coalesce(vt.requirement_text, '') as "requirementText"
      from vendor_tasks vt
      inner join projects p on p.id = vt.project_id
      inner join vendors v on v.id = vt.vendor_id
      where vt.project_id = $1
      order by v.name asc, vt.created_at asc
    `,
    [projectId],
  );
  return rows.rows;
}

export async function listDbVendorGroupsByProject(projectId: string): Promise<DbVendorGroupSummary[]> {
  const tasks = await listDbVendorTasksByProject(projectId);
  const groups = new Map<string, DbVendorGroupSummary>();

  tasks.forEach((task) => {
    const key = `${task.projectId}::${task.vendorId}`;
    const existing = groups.get(key);
    if (existing) {
      existing.taskCount += 1;
      existing.taskTitles.push(task.title);
      return;
    }

    groups.set(key, {
      projectId: task.projectId,
      projectName: task.projectName,
      vendorId: task.vendorId,
      vendorName: task.vendorName,
      eventDate: '-',
      taskCount: 1,
      representativeTaskId: task.id,
      taskTitles: [task.title],
    });
  });

  if (!groups.size) return [];

  const db = createPhase1DbClient();
  const projectRows = await db.query<{ eventDate: string }>(
    `select coalesce(to_char(event_date, 'YYYY-MM-DD'), '-') as "eventDate" from projects where id = $1 limit 1`,
    [projectId],
  );
  const eventDate = projectRows.rows[0]?.eventDate ?? '-';

  return Array.from(groups.values()).map((group) => ({
    ...group,
    eventDate,
  }));
}

type VendorGroupTaskRow = {
  taskId: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  eventDate: string;
  taskTitle: string;
  taskRequirementText: string;
  taskStatus: string;
  planId: string | null;
  planTitle: string | null;
  planRequirementText: string | null;
  planAmount: string | null;
  planSortOrder: number | null;
  snapshotTitle: string | null;
  snapshotAmount: string | null;
  snapshotSortOrder: number | null;
};

async function listVendorGroupTaskRows(projectId: string, vendorId: string): Promise<VendorGroupTaskRow[]> {
  const db = createPhase1DbClient();
  const result = await db.query<VendorGroupTaskRow>(
    `
      with latest_confirmations as (
        select distinct on (tc.task_id)
          tc.id,
          tc.task_id
        from task_confirmations tc
        where tc.flow_type = 'vendor'
        order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc nulls last, tc.created_at desc, tc.id desc
      )
      select
        vt.id as "taskId",
        vt.project_id as "projectId",
        p.name as "projectName",
        vt.vendor_id as "vendorId",
        v.name as "vendorName",
        coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
        vt.title as "taskTitle",
        coalesce(vt.requirement_text, '') as "taskRequirementText",
        vt.status as "taskStatus",
        vtp.id as "planId",
        vtp.title as "planTitle",
        coalesce(vtp.requirement_text, '') as "planRequirementText",
        case when vtp.amount is null then null else vtp.amount::text end as "planAmount",
        vtp.sort_order as "planSortOrder",
        tps.payload_json->>'title' as "snapshotTitle",
        tps.payload_json->>'amount' as "snapshotAmount",
        tps.sort_order as "snapshotSortOrder"
      from vendor_tasks vt
      inner join projects p on p.id = vt.project_id
      inner join vendors v on v.id = vt.vendor_id
      left join vendor_task_plans vtp on vtp.vendor_task_id = vt.id
      left join latest_confirmations lc on lc.task_id = vt.id
      left join task_confirmation_plan_snapshots tps on tps.task_confirmation_id = lc.id
      where vt.project_id = $1 and vt.vendor_id = $2
      order by vt.created_at asc, vt.id asc, vtp.sort_order asc nulls last, vtp.created_at asc nulls last, tps.sort_order asc nulls last, tps.created_at asc nulls last
    `,
    [projectId, vendorId],
  );
  return result.rows;
}

function mapVendorGroupRowsToRecords(rows: VendorGroupTaskRow[]): DbVendorTaskRecord[] {
  const taskMap = new Map<string, DbVendorTaskRecord>();
  const seenPlans = new Set<string>();
  const seenSnapshotRows = new Set<string>();

  for (const row of rows) {
    let task = taskMap.get(row.taskId);
    if (!task) {
      task = {
        id: row.taskId,
        projectId: row.projectId,
        projectName: row.projectName,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        title: row.taskTitle,
        requirementText: row.taskRequirementText,
        status: row.taskStatus,
        plans: [],
        documentRows: [],
      };
      taskMap.set(row.taskId, task);
    }

    if (row.planId && !seenPlans.has(row.planId)) {
      seenPlans.add(row.planId);
      task.plans.push({
        id: row.planId,
        title: row.planTitle ?? '',
        requirement: row.planRequirementText ?? '',
        amount: row.planAmount ? `NT$ ${row.planAmount}` : '',
      });
    }

    const snapshotKey = `${row.taskId}::${row.snapshotSortOrder ?? 'null'}::${row.snapshotTitle ?? ''}::${row.snapshotAmount ?? ''}`;
    if (row.snapshotTitle && !seenSnapshotRows.has(snapshotKey)) {
      seenSnapshotRows.add(snapshotKey);
      task.documentRows.push({
        id: task.documentRows.length + 1,
        item: row.snapshotTitle || `處理方案 ${task.documentRows.length + 1}`,
        quantity: row.snapshotAmount ?? '未填寫',
      });
    }
  }

  for (const task of taskMap.values()) {
    if (!task.documentRows.length) {
      task.documentRows = task.plans.map((plan, index) => ({
        id: index + 1,
        item: plan.title,
        quantity: plan.amount || '未填寫',
      }));
    }
  }

  return Array.from(taskMap.values());
}

export async function getDbVendorTaskById(id: string): Promise<DbVendorTaskRecord | null> {
  const db = createPhase1DbClient();
  const taskResult = await db.query<{ projectId: string; vendorId: string }>(
    `
      select project_id as "projectId", vendor_id as "vendorId"
      from vendor_tasks
      where id = $1
      limit 1
    `,
    [id],
  );
  const task = taskResult.rows[0];
  if (!task) return null;

  const rows = await listVendorGroupTaskRows(task.projectId, task.vendorId);
  const records = mapVendorGroupRowsToRecords(rows);
  return records.find((record) => record.id === id) ?? null;
}

export async function getDbVendorGroupDetail(projectId: string, vendorId: string): Promise<DbVendorGroupDetail | null> {
  const rows = await listVendorGroupTaskRows(projectId, vendorId);
  if (!rows.length) return null;

  const first = rows[0];
  return {
    projectId,
    projectName: first.projectName,
    vendorId,
    vendorName: first.vendorName,
    eventDate: first.eventDate,
    tasks: mapVendorGroupRowsToRecords(rows),
  };
}
