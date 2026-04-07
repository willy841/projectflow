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

export async function getDbVendorTaskById(id: string): Promise<DbVendorTaskRecord | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const task = await repositories.vendorTasks.findById(id);
  if (!task) return null;

  const [project, plans, confirmations, vendor] = await Promise.all([
    repositories.projects.findById(task.project_id),
    repositories.vendorTaskPlans.listByTask(task.id),
    repositories.taskConfirmations.listByTask('vendor', task.id),
    repositories.vendors.findById(task.vendor_id),
  ]);

  const latestConfirmation = confirmations[0] ?? null;
  const snapshots = latestConfirmation
    ? await repositories.taskConfirmations.listSnapshots(latestConfirmation.id)
    : [];

  const documentRows = snapshots.length
    ? snapshots.map((snapshot, index) => {
        const payload = snapshot.payload_json as { title?: string; amount?: string | null };
        return {
          id: index + 1,
          item: payload.title || `處理方案 ${index + 1}`,
          quantity: payload.amount ?? '未填寫',
        };
      })
    : plans.map((plan, index) => ({
        id: index + 1,
        item: plan.title,
        quantity: plan.amount ? `NT$ ${plan.amount}` : '未填寫',
      }));

  return {
    id: task.id,
    projectId: task.project_id,
    projectName: project?.name ?? '未命名專案',
    vendorId: task.vendor_id,
    vendorName: vendor?.name ?? '未指定廠商',
    title: task.title,
    requirementText: task.requirement_text ?? '',
    status: task.status,
    plans: plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      requirement: plan.requirement_text ?? '',
      amount: plan.amount ? `NT$ ${plan.amount}` : '',
    })),
    documentRows,
  };
}
