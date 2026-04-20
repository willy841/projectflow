import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { createPhase1Repositories } from '@/lib/db/phase1-repositories';

export type ProjectDesignDocumentReadModel = {
  projectId: string;
  projectName: string;
  rows: Array<{
    id: number;
    taskId: string;
    taskTitle: string;
    item: string;
    size: string;
    materialStructure: string;
    quantity: string;
  }>;
};

export type ProjectProcurementDocumentReadModel = {
  projectId: string;
  projectName: string;
  rows: Array<{
    id: number;
    taskId: string;
    taskTitle: string;
    item: string;
    quantity: string;
  }>;
};

export async function getProjectDesignDocument(projectId: string): Promise<ProjectDesignDocumentReadModel | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const project = await repositories.projects.findById(projectId);
  if (!project) return null;

  const [tasks, confirmations] = await Promise.all([
    repositories.designTasks.listByProject(projectId),
    db.query<{ taskId: string; confirmationId: string }>(`
      select distinct on (tc.task_id)
        tc.task_id as "taskId",
        tc.id as "confirmationId"
      from task_confirmations tc
      where tc.flow_type = 'design'
        and tc.project_id = $1
        and tc.status = 'confirmed'
      order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
    `, [projectId]),
  ]);

  const rows: ProjectDesignDocumentReadModel['rows'] = [];
  let counter = 1;

  for (const task of tasks) {
    const confirmationId = confirmations.rows.find((item) => item.taskId === task.id)?.confirmationId;
    if (confirmationId) {
      const snapshots = await repositories.taskConfirmations.listSnapshots(confirmationId);
      for (const snapshot of snapshots) {
        const payload = snapshot.payload_json as {
          title?: string;
          size?: string | null;
          material?: string | null;
          structure?: string | null;
          quantity?: string | null;
        };
        rows.push({
          id: counter++,
          taskId: task.id,
          taskTitle: task.title,
          item: payload.title || task.title,
          size: payload.size ?? '未填寫',
          materialStructure: payload.material ?? '未填寫',
          quantity: payload.quantity ?? '未填寫',
        });
      }
      continue;
    }

    rows.push({
      id: counter++,
      taskId: task.id,
      taskTitle: task.title,
      item: task.title,
      size: task.size ?? '未填寫',
      materialStructure: task.material ?? '未填寫',
      quantity: task.quantity ?? '未填寫',
    });
  }

  return {
    projectId,
    projectName: project.name,
    rows,
  };
}

export async function getProjectProcurementDocument(projectId: string): Promise<ProjectProcurementDocumentReadModel | null> {
  const db = createPhase1DbClient();
  const repositories = createPhase1Repositories(db);
  const project = await repositories.projects.findById(projectId);
  if (!project) return null;

  const [tasks, confirmations] = await Promise.all([
    repositories.procurementTasks.listByProject(projectId),
    db.query<{ taskId: string; confirmationId: string }>(`
      select distinct on (tc.task_id)
        tc.task_id as "taskId",
        tc.id as "confirmationId"
      from task_confirmations tc
      where tc.flow_type = 'procurement'
        and tc.project_id = $1
        and tc.status = 'confirmed'
      order by tc.task_id, tc.confirmation_no desc, tc.confirmed_at desc, tc.created_at desc, tc.id desc
    `, [projectId]),
  ]);

  const rows: ProjectProcurementDocumentReadModel['rows'] = [];
  let counter = 1;

  for (const task of tasks) {
    const confirmationId = confirmations.rows.find((item) => item.taskId === task.id)?.confirmationId;
    if (confirmationId) {
      const snapshots = await repositories.taskConfirmations.listSnapshots(confirmationId);
      for (const snapshot of snapshots) {
        const payload = snapshot.payload_json as {
          title?: string;
          quantity?: string | null;
        };
        rows.push({
          id: counter++,
          taskId: task.id,
          taskTitle: task.title,
          item: payload.title || task.title,
          quantity: payload.quantity ?? '未填寫',
        });
      }
      continue;
    }

    rows.push({
      id: counter++,
      taskId: task.id,
      taskTitle: task.title,
      item: task.title,
      quantity: task.quantity ?? '未填寫',
    });
  }

  return {
    projectId,
    projectName: project.name,
    rows,
  };
}
