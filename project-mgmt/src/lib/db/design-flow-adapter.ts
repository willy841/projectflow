import type { DesignDocumentRow, DesignTaskRecord } from '@/components/design-task-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type DbBackedDesignTaskRecord = DesignTaskRecord & {
  source: 'db' | 'mock';
};

type DbDesignTaskSummary = {
  id: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  title: string;
  size: string;
  material: string;
  structureRequired: string;
  quantity: string;
};

type DbDesignProjectSummary = {
  projectId: string;
  projectName: string;
  eventDate: string;
  taskCount: number;
};

function buildDocumentRowsFromPlans(
  plans: Array<{
    id: string;
    title: string;
    size: string | null;
    material: string | null;
    structure: string | null;
    quantity: string | null;
  }>,
): DesignDocumentRow[] {
  return plans.map((plan, index) => ({
    id: index + 1,
    item: plan.title || `處理方案 ${index + 1}`,
    size: plan.size ?? '未填寫',
    materialStructure: `${plan.material ?? '未填寫'} + ${plan.structure ?? '未填寫'}`,
    quantity: plan.quantity ?? '未填寫',
  }));
}

export async function listDbDesignTaskProjects(): Promise<DbDesignProjectSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbDesignProjectSummary>(`
    select
      p.id as "projectId",
      p.name as "projectName",
      coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
      count(dt.id)::int as "taskCount"
    from design_tasks dt
    inner join projects p on p.id = dt.project_id
    group by p.id, p.name, p.event_date
    order by p.event_date nulls last, p.created_at desc
  `);

  return rows.rows;
}

export async function listDbDesignTasksByProject(projectId: string): Promise<DbDesignTaskSummary[]> {
  const db = createPhase1DbClient();
  const rows = await db.query<DbDesignTaskSummary>(
    `
      select
        dt.id,
        dt.project_id as "projectId",
        p.name as "projectName",
        coalesce(to_char(p.event_date, 'YYYY-MM-DD'), '-') as "eventDate",
        dt.title,
        coalesce(dt.size, '未填寫') as size,
        coalesce(dt.material, '未填寫') as material,
        coalesce(dt.structure, '未填寫') as "structureRequired",
        coalesce(dt.quantity, '未填寫') as quantity
      from design_tasks dt
      inner join projects p on p.id = dt.project_id
      where dt.project_id = $1
      order by dt.created_at desc
    `,
    [projectId],
  );

  return rows.rows;
}

export async function getDbDesignTaskById(id: string): Promise<DbBackedDesignTaskRecord | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);

  const task = await repositories.designTasks.findById(id);
  if (!task) return null;

  const [project, plans, confirmations] = await Promise.all([
    repositories.projects.findById(task.project_id),
    repositories.designTaskPlans.listByTask(task.id),
    repositories.taskConfirmations.listByTask('design', task.id),
  ]);

  const latestConfirmation = confirmations[0] ?? null;
  const snapshots = latestConfirmation
    ? await repositories.taskConfirmations.listSnapshots(latestConfirmation.id)
    : [];

  const documentRows = snapshots.length
    ? snapshots.map((snapshot, index) => {
        const payload = snapshot.payload_json as {
          title?: string;
          size?: string | null;
          material?: string | null;
          structure?: string | null;
          quantity?: string | null;
        };

        return {
          id: index + 1,
          item: payload.title || `處理方案 ${index + 1}`,
          size: payload.size ?? '未填寫',
          materialStructure: `${payload.material ?? '未填寫'} + ${payload.structure ?? '未填寫'}`,
          quantity: payload.quantity ?? '未填寫',
        };
      })
    : buildDocumentRowsFromPlans(plans);

  return {
    id: task.id,
    projectId: task.project_id,
    projectName: project?.name ?? '未命名專案',
    projectCode: project?.code ?? '-',
    client: project?.client_name ?? '-',
    owner: '-',
    title: task.title,
    assignee: '-',
    due: project?.event_date instanceof Date ? project.event_date.toISOString().slice(0, 10) : (project?.event_date ?? '-'),
    status: task.status,
    size: task.size ?? '未填寫',
    material: task.material ?? '未填寫',
    quantity: task.quantity ?? '未填寫',
    referenceUrl: task.reference_url ?? '',
    structureRequired: task.structure ?? '未填寫',
    outsourceStatus: latestConfirmation ? '已確認' : '待確認',
    outsourceTarget: plans[0]?.vendor_name_text ?? '尚未指定',
    cost: plans[0]?.amount ? `NT$ ${plans[0].amount}` : 'NT$ 0',
    note: task.requirement_text ?? '',
    plans: plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      size: plan.size ?? '',
      material: plan.material ?? '',
      structure: plan.structure ?? '',
      quantity: plan.quantity ?? '',
      amount: plan.amount ? `NT$ ${plan.amount}` : '',
      previewUrl: plan.preview_url ?? '',
      vendor: plan.vendor_name_text ?? '',
    })),
    documentRows,
    documentLink: '#',
    source: 'db',
  };
}
