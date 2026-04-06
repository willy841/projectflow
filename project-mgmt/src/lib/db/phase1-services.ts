import type {
  InsertDesignTaskInput,
  InsertDesignTaskPlanInput,
  InsertProcurementTaskInput,
  InsertProcurementTaskPlanInput,
  InsertTaskConfirmationPlanSnapshotInput,
  InsertVendorTaskInput,
  InsertVendorTaskPlanInput,
} from '@/lib/db/phase1-inputs';
import type {
  DesignPlanSyncInput,
  PlanSyncSummary,
  ProcurementPlanSyncInput,
} from '@/lib/db/plan-sync';
import { diffDesignPlans, diffProcurementPlans } from '@/lib/db/plan-sync';
import type {
  DesignTaskPlanRow,
  DesignTaskRow,
  ProcurementTaskPlanRow,
  ProcurementTaskRow,
  TaskConfirmationPlanPayloadByFlow,
  TaskConfirmationRow,
  UUID,
  VendorTaskPlanRow,
  VendorTaskRow,
} from '@/lib/db/phase1-types';
import type { Phase1Repositories } from '@/lib/db/phase1-repositories';

export interface Phase1Services {
  publishDesignTask(input: InsertDesignTaskInput): Promise<DesignTaskRow>;
  publishProcurementTask(input: InsertProcurementTaskInput): Promise<ProcurementTaskRow>;
  publishVendorTask(input: InsertVendorTaskInput): Promise<VendorTaskRow>;
  saveDesignPlan(input: InsertDesignTaskPlanInput): Promise<DesignTaskPlanRow>;
  replaceDesignPlans(taskId: UUID, inputs: InsertDesignTaskPlanInput[]): Promise<DesignTaskPlanRow[]>;
  syncDesignPlans(taskId: UUID, inputs: DesignPlanSyncInput[]): Promise<PlanSyncSummary<DesignTaskPlanRow>>;
  saveProcurementPlan(input: InsertProcurementTaskPlanInput): Promise<ProcurementTaskPlanRow>;
  syncProcurementPlans(taskId: UUID, inputs: ProcurementPlanSyncInput[]): Promise<PlanSyncSummary<ProcurementTaskPlanRow>>;
  saveVendorPlan(input: InsertVendorTaskPlanInput): Promise<VendorTaskPlanRow>;
  confirmDesignTaskPlans(taskId: UUID): Promise<TaskConfirmationRow>;
  confirmProcurementTaskPlans(taskId: UUID): Promise<TaskConfirmationRow>;
  confirmVendorTaskPlans(taskId: UUID): Promise<TaskConfirmationRow>;
}

async function nextConfirmationNo(
  repositories: Phase1Repositories,
  flowType: 'design' | 'procurement' | 'vendor',
  taskId: UUID,
): Promise<number> {
  const existing = await repositories.taskConfirmations.listByTask(flowType, taskId);
  return (existing[0]?.confirmation_no ?? 0) + 1;
}

export function createPhase1Services(repositories: Phase1Repositories): Phase1Services {
  return {
    async publishDesignTask(input) {
      return repositories.designTasks.insert(input);
    },
    async publishProcurementTask(input) {
      return repositories.procurementTasks.insert(input);
    },
    async publishVendorTask(input) {
      return repositories.vendorTasks.insert(input);
    },
    async saveDesignPlan(input) {
      return repositories.designTaskPlans.insert(input);
    },
    async replaceDesignPlans(taskId, inputs) {
      await repositories.designTaskPlans.deleteByTask(taskId);
      const rows: DesignTaskPlanRow[] = [];

      for (const input of inputs) {
        rows.push(await repositories.designTaskPlans.insert(input));
      }

      return rows;
    },
    async syncDesignPlans(taskId, inputs) {
      const existing = await repositories.designTaskPlans.listByTask(taskId);
      const diff = diffDesignPlans(existing, inputs);

      for (const deleteId of diff.deleteIds) {
        await repositories.designTaskPlans.deleteById(deleteId);
      }

      for (const update of diff.updates) {
        await repositories.designTaskPlans.update(update.id, update.input);
      }

      for (const input of diff.inserts) {
        await repositories.designTaskPlans.insert(input);
      }

      return {
        rows: await repositories.designTaskPlans.listByTask(taskId),
        inserted: diff.inserts.length,
        updated: diff.updates.length,
        deleted: diff.deleteIds.length,
        kept: diff.keptIds.length,
      };
    },
    async saveProcurementPlan(input) {
      return repositories.procurementTaskPlans.insert(input);
    },
    async syncProcurementPlans(taskId, inputs) {
      const existing = await repositories.procurementTaskPlans.listByTask(taskId);
      const diff = diffProcurementPlans(existing, inputs);

      for (const deleteId of diff.deleteIds) {
        await repositories.procurementTaskPlans.deleteById(deleteId);
      }

      for (const update of diff.updates) {
        await repositories.procurementTaskPlans.update(update.id, update.input);
      }

      for (const input of diff.inserts) {
        await repositories.procurementTaskPlans.insert(input);
      }

      return {
        rows: await repositories.procurementTaskPlans.listByTask(taskId),
        inserted: diff.inserts.length,
        updated: diff.updates.length,
        deleted: diff.deleteIds.length,
        kept: diff.keptIds.length,
      };
    },
    async saveVendorPlan(input) {
      return repositories.vendorTaskPlans.insert(input);
    },
    async confirmDesignTaskPlans(taskId) {
      const task = await repositories.designTasks.findById(taskId);
      if (!task) {
        throw new Error(`Design task not found: ${taskId}`);
      }

      const plans = await repositories.designTaskPlans.listByTask(taskId);
      const confirmation = await repositories.taskConfirmations.insert({
        project_id: task.project_id,
        flow_type: 'design',
        task_id: taskId,
        confirmation_no: await nextConfirmationNo(repositories, 'design', taskId),
        status: 'confirmed',
      });

      for (const plan of plans) {
        const payload: TaskConfirmationPlanPayloadByFlow['design'] = {
          title: plan.title,
          size: plan.size,
          material: plan.material,
          structure: plan.structure,
          quantity: plan.quantity,
          amount: plan.amount,
          preview_url: plan.preview_url,
          vendor_name_text: plan.vendor_name_text,
        };

        const snapshotInput: InsertTaskConfirmationPlanSnapshotInput<'design'> = {
          task_confirmation_id: confirmation.id,
          source_plan_id: plan.id,
          sort_order: plan.sort_order,
          payload_json: payload,
        };
        await repositories.taskConfirmations.insertSnapshot('design', snapshotInput);
      }

      return confirmation;
    },
    async confirmProcurementTaskPlans(taskId) {
      const task = await repositories.procurementTasks.findById(taskId);
      if (!task) {
        throw new Error(`Procurement task not found: ${taskId}`);
      }

      const plans = await repositories.procurementTaskPlans.listByTask(taskId);
      const confirmation = await repositories.taskConfirmations.insert({
        project_id: task.project_id,
        flow_type: 'procurement',
        task_id: taskId,
        confirmation_no: await nextConfirmationNo(repositories, 'procurement', taskId),
        status: 'confirmed',
      });

      for (const plan of plans) {
        const payload: TaskConfirmationPlanPayloadByFlow['procurement'] = {
          title: plan.title,
          quantity: plan.quantity,
          amount: plan.amount,
          preview_url: plan.preview_url,
          vendor_name_text: plan.vendor_name_text,
        };

        const snapshotInput: InsertTaskConfirmationPlanSnapshotInput<'procurement'> = {
          task_confirmation_id: confirmation.id,
          source_plan_id: plan.id,
          sort_order: plan.sort_order,
          payload_json: payload,
        };
        await repositories.taskConfirmations.insertSnapshot('procurement', snapshotInput);
      }

      return confirmation;
    },
    async confirmVendorTaskPlans(taskId) {
      const task = await repositories.vendorTasks.findById(taskId);
      if (!task) {
        throw new Error(`Vendor task not found: ${taskId}`);
      }

      const plans = await repositories.vendorTaskPlans.listByTask(taskId);
      const confirmation = await repositories.taskConfirmations.insert({
        project_id: task.project_id,
        flow_type: 'vendor',
        task_id: taskId,
        confirmation_no: await nextConfirmationNo(repositories, 'vendor', taskId),
        status: 'confirmed',
      });

      for (const plan of plans) {
        const payload: TaskConfirmationPlanPayloadByFlow['vendor'] = {
          title: plan.title,
          requirement_text: plan.requirement_text,
          amount: plan.amount,
        };

        const snapshotInput: InsertTaskConfirmationPlanSnapshotInput<'vendor'> = {
          task_confirmation_id: confirmation.id,
          source_plan_id: plan.id,
          sort_order: plan.sort_order,
          payload_json: payload,
        };
        await repositories.taskConfirmations.insertSnapshot('vendor', snapshotInput);
      }

      return confirmation;
    },
  };
}
