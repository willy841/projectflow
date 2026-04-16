import type { ProcurementBoardRecord } from '@/components/procurement-task-board-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type DbBackedProcurementTaskRecord = ProcurementBoardRecord & {
  source: 'db' | 'mock';
};

type DbProcurementProjectSummary = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

type DbProcurementTaskSummary = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  quantity: string;
  costLabel: string;
};


export async function listDbProcurementTaskProjects(): Promise<DbProcurementProjectSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbProcurementProjectSummary>(`
    select
      p.id as "projectId",
      p.name as "projectName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      count(pt.id)::int as "taskCount"
    from procurement_tasks pt
    inner join projects p on p.id = pt.project_id
    group by p.id, p.name, p.event_date
    order by p.event_date nulls last, p.created_at desc
  `);

  return rows.rows;
}

export async function listDbProcurementTasksByProject(projectId: string): Promise<DbProcurementTaskSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbProcurementTaskSummary>(
    `
      select
        pt.id,
        pt.project_id as "projectId",
        p.name as "projectName",
        pt.title,
        coalesce(pt.quantity, '未填寫') as quantity,
        coalesce(pt.budget_note, '未填寫') as "costLabel"
      from procurement_tasks pt
      inner join projects p on p.id = pt.project_id
      where pt.project_id = $1
      order by pt.created_at desc
    `,
    [projectId],
  );

  return rows.rows;
}

export async function getDbProcurementTaskById(id: string): Promise<DbBackedProcurementTaskRecord | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);

  const task = await repositories.procurementTasks.findById(id);
  if (!task) return null;

  const [project, plans, confirmations] = await Promise.all([
    repositories.projects.findById(task.project_id),
    repositories.procurementTaskPlans.listByTask(task.id),
    repositories.taskConfirmations.listByTask('procurement', task.id),
  ]);

  const latestConfirmation = confirmations[0] ?? null;
  const snapshots = latestConfirmation
    ? await repositories.taskConfirmations.listSnapshots(latestConfirmation.id)
    : [];

  const documentRows = snapshots.map((snapshot, index) => {
    const payload = snapshot.payload_json as {
      title?: string;
      quantity?: string | null;
    };

    return {
      id: index + 1,
      item: payload.title || `處理方案 ${index + 1}`,
      quantity: payload.quantity ?? '未填寫',
    };
  });

  return {
    id: task.id,
    projectId: task.project_id,
    projectName: project?.name ?? '未命名專案',
    title: task.title,
    size: '未填寫',
    material: '未填寫',
    quantity: task.quantity ?? '未填寫',
    replyCount: latestConfirmation ? 1 : 0,
    confirmStatus: latestConfirmation ? '已確認' : '待確認',
    documentStatus: latestConfirmation ? '已生成' : '未生成',
    vendorName: plans[0]?.vendor_name_text ?? '未指定',
    costLabel: task.budget_note ?? '未填寫',
    costAmount: Number(task.budget_note?.replace?.(/[^\d.-]/g, '') ?? 0),
    costLocked: Boolean(latestConfirmation),
    note: task.requirement_text ?? '',
    referenceUrl: task.reference_url ?? '',
    plans: plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      quantity: plan.quantity ?? '',
      amount: plan.amount ? `NT$ ${plan.amount}` : '',
      previewUrl: plan.preview_url ?? '',
      vendor: plan.vendor_name_text ?? '',
    })),
    documentRows,
    source: 'db',
  };
}
