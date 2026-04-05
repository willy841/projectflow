import type { DesignDocumentRow, DesignTaskRecord } from '@/components/design-task-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type DbBackedDesignTaskRecord = DesignTaskRecord & {
  source: 'db' | 'mock';
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
  const documentRows = buildDocumentRowsFromPlans(plans);

  return {
    id: task.id,
    projectId: task.project_id,
    projectName: project?.name ?? '未命名專案',
    projectCode: project?.code ?? '-',
    client: project?.client_name ?? '-',
    owner: '-',
    title: task.title,
    assignee: '-',
    due: project?.event_date ?? '-',
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
