import type {
  InsertDesignTaskInput,
  InsertDesignTaskPlanInput,
  InsertProcurementTaskInput,
  InsertProcurementTaskPlanInput,
  InsertProjectExecutionItemInput,
  InsertProjectInput,
  InsertTaskConfirmationInput,
  InsertTaskConfirmationPlanSnapshotInput,
  InsertVendorInput,
  InsertVendorTaskInput,
  InsertVendorTaskPlanInput,
  UpdateDesignTaskInput,
  UpdateDesignTaskPlanInput,
  UpdateProcurementTaskInput,
  UpdateProcurementTaskPlanInput,
  UpdateProjectExecutionItemInput,
  UpdateProjectInput,
  UpdateVendorInput,
  UpdateVendorTaskInput,
  UpdateVendorTaskPlanInput,
} from '@/lib/db/phase1-inputs';
import type {
  DesignTaskPlanRow,
  DesignTaskRow,
  FlowType,
  ProcurementTaskPlanRow,
  ProcurementTaskRow,
  ProjectExecutionItemRow,
  ProjectRow,
  TaskConfirmationPlanSnapshotRow,
  TaskConfirmationRow,
  UUID,
  VendorRow,
  VendorTaskPlanRow,
  VendorTaskRow,
} from '@/lib/db/phase1-types';
import type { Phase1DbClient, QueryResultRow } from '@/lib/db/phase1-client';
import {
  buildInsertStatement,
  buildUpdateStatement,
  entriesFromInput,
} from '@/lib/db/phase1-sql';

export interface ProjectDeleteDependencySummary {
  executionItemCount: number;
  designTaskCount: number;
  procurementTaskCount: number;
  vendorTaskCount: number;
  confirmationCount: number;
  manualCostCount: number;
}

export interface ProjectRepository {
  findById(id: UUID): Promise<ProjectRow | null>;
  list(): Promise<ProjectRow[]>;
  insert(input: InsertProjectInput): Promise<ProjectRow>;
  update(id: UUID, input: UpdateProjectInput): Promise<ProjectRow>;
  getDeleteDependencySummary(id: UUID): Promise<ProjectDeleteDependencySummary>;
  delete(id: UUID): Promise<void>;
}

export interface VendorRepository {
  findById(id: UUID): Promise<VendorRow | null>;
  findByNormalizedName(normalizedName: string): Promise<VendorRow | null>;
  list(): Promise<VendorRow[]>;
  insert(input: InsertVendorInput): Promise<VendorRow>;
  update(id: UUID, input: UpdateVendorInput): Promise<VendorRow>;
}

export interface ProjectExecutionItemRepository {
  listByProject(projectId: UUID): Promise<ProjectExecutionItemRow[]>;
  insert(input: InsertProjectExecutionItemInput): Promise<ProjectExecutionItemRow>;
  update(id: UUID, input: UpdateProjectExecutionItemInput): Promise<ProjectExecutionItemRow>;
}

export interface DesignTaskRepository {
  listByProject(projectId: UUID): Promise<DesignTaskRow[]>;
  findById(id: UUID): Promise<DesignTaskRow | null>;
  insert(input: InsertDesignTaskInput): Promise<DesignTaskRow>;
  update(id: UUID, input: UpdateDesignTaskInput): Promise<DesignTaskRow>;
}

export interface ProcurementTaskRepository {
  listByProject(projectId: UUID): Promise<ProcurementTaskRow[]>;
  findById(id: UUID): Promise<ProcurementTaskRow | null>;
  insert(input: InsertProcurementTaskInput): Promise<ProcurementTaskRow>;
  update(id: UUID, input: UpdateProcurementTaskInput): Promise<ProcurementTaskRow>;
}

export interface VendorTaskRepository {
  listByProject(projectId: UUID): Promise<VendorTaskRow[]>;
  listByProjectAndVendor(projectId: UUID, vendorId: UUID): Promise<VendorTaskRow[]>;
  findById(id: UUID): Promise<VendorTaskRow | null>;
  insert(input: InsertVendorTaskInput): Promise<VendorTaskRow>;
  update(id: UUID, input: UpdateVendorTaskInput): Promise<VendorTaskRow>;
}

export interface DesignTaskPlanRepository {
  listByTask(designTaskId: UUID): Promise<DesignTaskPlanRow[]>;
  deleteByTask(designTaskId: UUID): Promise<void>;
  deleteById(id: UUID): Promise<void>;
  insert(input: InsertDesignTaskPlanInput): Promise<DesignTaskPlanRow>;
  update(id: UUID, input: UpdateDesignTaskPlanInput): Promise<DesignTaskPlanRow>;
}

export interface ProcurementTaskPlanRepository {
  listByTask(procurementTaskId: UUID): Promise<ProcurementTaskPlanRow[]>;
  deleteByTask(procurementTaskId: UUID): Promise<void>;
  deleteById(id: UUID): Promise<void>;
  insert(input: InsertProcurementTaskPlanInput): Promise<ProcurementTaskPlanRow>;
  update(id: UUID, input: UpdateProcurementTaskPlanInput): Promise<ProcurementTaskPlanRow>;
}

export interface VendorTaskPlanRepository {
  listByTask(vendorTaskId: UUID): Promise<VendorTaskPlanRow[]>;
  deleteByTask(vendorTaskId: UUID): Promise<void>;
  deleteById(id: UUID): Promise<void>;
  insert(input: InsertVendorTaskPlanInput): Promise<VendorTaskPlanRow>;
  update(id: UUID, input: UpdateVendorTaskPlanInput): Promise<VendorTaskPlanRow>;
}

export interface TaskConfirmationRepository {
  listByTask(flowType: FlowType, taskId: UUID): Promise<TaskConfirmationRow[]>;
  listSnapshots(taskConfirmationId: UUID): Promise<TaskConfirmationPlanSnapshotRow[]>;
  insert(input: InsertTaskConfirmationInput): Promise<TaskConfirmationRow>;
  insertSnapshot<TFlow extends FlowType>(
    flowType: TFlow,
    input: InsertTaskConfirmationPlanSnapshotInput<TFlow>,
  ): Promise<TaskConfirmationPlanSnapshotRow>;
}

export interface Phase1Repositories {
  projects: ProjectRepository;
  vendors: VendorRepository;
  executionItems: ProjectExecutionItemRepository;
  designTasks: DesignTaskRepository;
  procurementTasks: ProcurementTaskRepository;
  vendorTasks: VendorTaskRepository;
  designTaskPlans: DesignTaskPlanRepository;
  procurementTaskPlans: ProcurementTaskPlanRepository;
  vendorTaskPlans: VendorTaskPlanRepository;
  taskConfirmations: TaskConfirmationRepository;
}

async function firstRowOrNull<TRow extends QueryResultRow>(
  promise: Promise<{ rows: TRow[] }>,
): Promise<TRow | null> {
  const result = await promise;
  return result.rows[0] ?? null;
}

async function insertRow<TRow extends QueryResultRow, TInput extends Record<string, unknown>>(
  db: Phase1DbClient,
  table: string,
  input: TInput,
): Promise<TRow> {
  const enrichedInput = {
    id: input.id ?? crypto.randomUUID(),
    ...input,
  } as TInput & { id: string };
  const entries = entriesFromInput(enrichedInput);
  const columns = entries.map(([key]) => String(key));
  const values = entries.map(([, value]) => value);
  const result = await db.query<TRow>(buildInsertStatement(table, columns), values);
  const row = result.rows[0];

  if (!row) {
    throw new Error(`Insert into ${table} returned no rows.`);
  }

  return row;
}

async function updateRow<TRow extends QueryResultRow, TInput extends Record<string, unknown>>(
  db: Phase1DbClient,
  table: string,
  id: UUID,
  input: TInput,
): Promise<TRow> {
  const entries = entriesFromInput(input);

  if (entries.length === 0) {
    throw new Error(`Update on ${table} requires at least one field.`);
  }

  const columns = entries.map(([key]) => String(key));
  const values = entries.map(([, value]) => value);
  const result = await db.query<TRow>(buildUpdateStatement(table, columns, 'id'), [...values, id]);
  const row = result.rows[0];

  if (!row) {
    throw new Error(`Update on ${table} returned no rows for id=${id}.`);
  }

  return row;
}

export function createPhase1Repositories(db: Phase1DbClient): Phase1Repositories {
  return {
    projects: {
      async findById(id) {
        return firstRowOrNull<ProjectRow>(
          db.query<ProjectRow>(
            `
              select *
              from projects
              where id = $1
            `,
            [id],
          ),
        );
      },
      async list() {
        const result = await db.query<ProjectRow>(
          `
            select *
            from projects
            order by event_date nulls last, created_at desc
          `,
        );
        return result.rows;
      },
      async insert(input) {
        return insertRow<ProjectRow, InsertProjectInput>(db, 'projects', input);
      },
      async update(id, input) {
        return updateRow<ProjectRow, UpdateProjectInput>(db, 'projects', id, input);
      },
      async getDeleteDependencySummary(id) {
        const [executionItems, designTasks, procurementTasks, vendorTasks, confirmations, manualCosts] = await Promise.all([
          db.query<{ count: string }>(
            `select count(*)::text as count from project_execution_items where project_id = $1`,
            [id],
          ),
          db.query<{ count: string }>(
            `select count(*)::text as count from design_tasks where project_id = $1`,
            [id],
          ),
          db.query<{ count: string }>(
            `select count(*)::text as count from procurement_tasks where project_id = $1`,
            [id],
          ),
          db.query<{ count: string }>(
            `select count(*)::text as count from vendor_tasks where project_id = $1`,
            [id],
          ),
          db.query<{ count: string }>(
            `select count(*)::text as count from task_confirmations where project_id = $1`,
            [id],
          ),
          db.query<{ count: string }>(
            `select count(*)::text as count from financial_manual_costs where project_id = $1`,
            [id],
          ),
        ]);

        return {
          executionItemCount: Number(executionItems.rows[0]?.count ?? 0),
          designTaskCount: Number(designTasks.rows[0]?.count ?? 0),
          procurementTaskCount: Number(procurementTasks.rows[0]?.count ?? 0),
          vendorTaskCount: Number(vendorTasks.rows[0]?.count ?? 0),
          confirmationCount: Number(confirmations.rows[0]?.count ?? 0),
          manualCostCount: Number(manualCosts.rows[0]?.count ?? 0),
        };
      },
      async delete(id) {
        await db.query(
          `
            delete from projects
            where id = $1
          `,
          [id],
        );
      },
    },
    vendors: {
      async findById(id) {
        return firstRowOrNull<VendorRow>(
          db.query<VendorRow>(
            `
              select *
              from vendors
              where id = $1
            `,
            [id],
          ),
        );
      },
      async findByNormalizedName(normalizedName) {
        return firstRowOrNull<VendorRow>(
          db.query<VendorRow>(
            `
              select *
              from vendors
              where normalized_name = $1
            `,
            [normalizedName],
          ),
        );
      },
      async list() {
        const result = await db.query<VendorRow>(
          `
            select *
            from vendors
            order by name asc
          `,
        );
        return result.rows;
      },
      async insert(input) {
        return insertRow<VendorRow, InsertVendorInput>(db, 'vendors', input);
      },
      async update(id, input) {
        return updateRow<VendorRow, UpdateVendorInput>(db, 'vendors', id, input);
      },
    },
    executionItems: {
      async listByProject(projectId) {
        const result = await db.query<ProjectExecutionItemRow>(
          `
            select *
            from project_execution_items
            where project_id = $1
            order by sort_order asc, created_at asc
          `,
          [projectId],
        );
        return result.rows;
      },
      async insert(input) {
        return insertRow<ProjectExecutionItemRow, InsertProjectExecutionItemInput>(
          db,
          'project_execution_items',
          input,
        );
      },
      async update(id, input) {
        return updateRow<ProjectExecutionItemRow, UpdateProjectExecutionItemInput>(
          db,
          'project_execution_items',
          id,
          input,
        );
      },
    },
    designTasks: {
      async listByProject(projectId) {
        const result = await db.query<DesignTaskRow>(
          `
            select *
            from design_tasks
            where project_id = $1
            order by created_at desc
          `,
          [projectId],
        );
        return result.rows;
      },
      async findById(id) {
        return firstRowOrNull<DesignTaskRow>(
          db.query<DesignTaskRow>(
            `
              select *
              from design_tasks
              where id = $1
            `,
            [id],
          ),
        );
      },
      async insert(input) {
        return insertRow<DesignTaskRow, InsertDesignTaskInput>(db, 'design_tasks', input);
      },
      async update(id, input) {
        return updateRow<DesignTaskRow, UpdateDesignTaskInput>(db, 'design_tasks', id, input);
      },
    },
    procurementTasks: {
      async listByProject(projectId) {
        const result = await db.query<ProcurementTaskRow>(
          `
            select *
            from procurement_tasks
            where project_id = $1
            order by created_at desc
          `,
          [projectId],
        );
        return result.rows;
      },
      async findById(id) {
        return firstRowOrNull<ProcurementTaskRow>(
          db.query<ProcurementTaskRow>(
            `
              select *
              from procurement_tasks
              where id = $1
            `,
            [id],
          ),
        );
      },
      async insert(input) {
        return insertRow<ProcurementTaskRow, InsertProcurementTaskInput>(db, 'procurement_tasks', input);
      },
      async update(id, input) {
        return updateRow<ProcurementTaskRow, UpdateProcurementTaskInput>(
          db,
          'procurement_tasks',
          id,
          input,
        );
      },
    },
    vendorTasks: {
      async listByProject(projectId) {
        const result = await db.query<VendorTaskRow>(
          `
            select *
            from vendor_tasks
            where project_id = $1
            order by created_at desc
          `,
          [projectId],
        );
        return result.rows;
      },
      async listByProjectAndVendor(projectId, vendorId) {
        const result = await db.query<VendorTaskRow>(
          `
            select *
            from vendor_tasks
            where project_id = $1 and vendor_id = $2
            order by created_at desc
          `,
          [projectId, vendorId],
        );
        return result.rows;
      },
      async findById(id) {
        return firstRowOrNull<VendorTaskRow>(
          db.query<VendorTaskRow>(
            `
              select *
              from vendor_tasks
              where id = $1
            `,
            [id],
          ),
        );
      },
      async insert(input) {
        return insertRow<VendorTaskRow, InsertVendorTaskInput>(db, 'vendor_tasks', input);
      },
      async update(id, input) {
        return updateRow<VendorTaskRow, UpdateVendorTaskInput>(db, 'vendor_tasks', id, input);
      },
    },
    designTaskPlans: {
      async listByTask(designTaskId) {
        const result = await db.query<DesignTaskPlanRow>(
          `
            select *
            from design_task_plans
            where design_task_id = $1
            order by sort_order asc, created_at asc
          `,
          [designTaskId],
        );
        return result.rows;
      },
      async deleteByTask(designTaskId) {
        await db.query(
          `
            delete from design_task_plans
            where design_task_id = $1
          `,
          [designTaskId],
        );
      },
      async deleteById(id) {
        await db.query(
          `
            delete from design_task_plans
            where id = $1
          `,
          [id],
        );
      },
      async insert(input) {
        return insertRow<DesignTaskPlanRow, InsertDesignTaskPlanInput>(db, 'design_task_plans', input);
      },
      async update(id, input) {
        return updateRow<DesignTaskPlanRow, UpdateDesignTaskPlanInput>(
          db,
          'design_task_plans',
          id,
          input,
        );
      },
    },
    procurementTaskPlans: {
      async listByTask(procurementTaskId) {
        const result = await db.query<ProcurementTaskPlanRow>(
          `
            select *
            from procurement_task_plans
            where procurement_task_id = $1
            order by sort_order asc, created_at asc
          `,
          [procurementTaskId],
        );
        return result.rows;
      },
      async deleteByTask(procurementTaskId) {
        await db.query(
          `
            delete from procurement_task_plans
            where procurement_task_id = $1
          `,
          [procurementTaskId],
        );
      },
      async deleteById(id) {
        await db.query(
          `
            delete from procurement_task_plans
            where id = $1
          `,
          [id],
        );
      },
      async insert(input) {
        return insertRow<ProcurementTaskPlanRow, InsertProcurementTaskPlanInput>(
          db,
          'procurement_task_plans',
          input,
        );
      },
      async update(id, input) {
        return updateRow<ProcurementTaskPlanRow, UpdateProcurementTaskPlanInput>(
          db,
          'procurement_task_plans',
          id,
          input,
        );
      },
    },
    vendorTaskPlans: {
      async listByTask(vendorTaskId) {
        const result = await db.query<VendorTaskPlanRow>(
          `
            select *
            from vendor_task_plans
            where vendor_task_id = $1
            order by sort_order asc, created_at asc
          `,
          [vendorTaskId],
        );
        return result.rows;
      },
      async deleteByTask(vendorTaskId) {
        await db.query(
          `
            delete from vendor_task_plans
            where vendor_task_id = $1
          `,
          [vendorTaskId],
        );
      },
      async deleteById(id) {
        await db.query(
          `
            delete from vendor_task_plans
            where id = $1
          `,
          [id],
        );
      },
      async insert(input) {
        return insertRow<VendorTaskPlanRow, InsertVendorTaskPlanInput>(db, 'vendor_task_plans', input);
      },
      async update(id, input) {
        return updateRow<VendorTaskPlanRow, UpdateVendorTaskPlanInput>(
          db,
          'vendor_task_plans',
          id,
          input,
        );
      },
    },
    taskConfirmations: {
      async listByTask(flowType, taskId) {
        const result = await db.query<TaskConfirmationRow>(
          `
            select *
            from task_confirmations
            where flow_type = $1 and task_id = $2
            order by confirmation_no desc, confirmed_at desc
          `,
          [flowType, taskId],
        );
        return result.rows;
      },
      async listSnapshots(taskConfirmationId) {
        const result = await db.query<TaskConfirmationPlanSnapshotRow>(
          `
            select *
            from task_confirmation_plan_snapshots
            where task_confirmation_id = $1
            order by sort_order asc, created_at asc
          `,
          [taskConfirmationId],
        );
        return result.rows;
      },
      async insert(input) {
        const confirmationInput = {
          ...input,
          confirmed_at: input.confirmed_at ?? new Date().toISOString(),
        };

        return insertRow<
          TaskConfirmationRow,
          InsertTaskConfirmationInput & { confirmed_at: string }
        >(db, 'task_confirmations', confirmationInput);
      },
      async insertSnapshot(_flowType, input) {
        return insertRow<TaskConfirmationPlanSnapshotRow, typeof input>(
          db,
          'task_confirmation_plan_snapshots',
          input,
        );
      },
    },
  };
}
