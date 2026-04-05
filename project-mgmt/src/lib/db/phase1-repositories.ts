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
import type { Phase1DbClient } from '@/lib/db/phase1-client';
import {
  buildInsertStatement,
  buildUpdateStatement,
  entriesFromInput,
} from '@/lib/db/phase1-sql';

export interface ProjectRepository {
  findById(id: UUID): Promise<ProjectRow | null>;
  list(): Promise<ProjectRow[]>;
  insert(input: InsertProjectInput): Promise<ProjectRow>;
  update(id: UUID, input: UpdateProjectInput): Promise<ProjectRow>;
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
  insert(input: InsertDesignTaskPlanInput): Promise<DesignTaskPlanRow>;
  update(id: UUID, input: UpdateDesignTaskPlanInput): Promise<DesignTaskPlanRow>;
}

export interface ProcurementTaskPlanRepository {
  listByTask(procurementTaskId: UUID): Promise<ProcurementTaskPlanRow[]>;
  insert(input: InsertProcurementTaskPlanInput): Promise<ProcurementTaskPlanRow>;
  update(id: UUID, input: UpdateProcurementTaskPlanInput): Promise<ProcurementTaskPlanRow>;
}

export interface VendorTaskPlanRepository {
  listByTask(vendorTaskId: UUID): Promise<VendorTaskPlanRow[]>;
  insert(input: InsertVendorTaskPlanInput): Promise<VendorTaskPlanRow>;
  update(id: UUID, input: UpdateVendorTaskPlanInput): Promise<VendorTaskPlanRow>;
}

export interface TaskConfirmationRepository {
  listByTask(flowType: FlowType, taskId: UUID): Promise<TaskConfirmationRow[]>;
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

function notImplemented(name: string): never {
  throw new Error(`${name} is not implemented yet. Complete this repository method when write path is needed.`);
}

async function firstRowOrNull<TRow>(promise: Promise<{ rows: TRow[] }>): Promise<TRow | null> {
  const result = await promise;
  return result.rows[0] ?? null;
}

async function insertRow<TRow, TInput extends Record<string, unknown>>(
  db: Phase1DbClient,
  table: string,
  input: TInput,
): Promise<TRow> {
  const entries = entriesFromInput(input);
  const columns = entries.map(([key]) => String(key));
  const values = entries.map(([, value]) => value);
  const result = await db.query<TRow>(buildInsertStatement(table, columns), values);
  const row = result.rows[0];

  if (!row) {
    throw new Error(`Insert into ${table} returned no rows.`);
  }

  return row;
}

async function updateRow<TRow, TInput extends Record<string, unknown>>(
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
      async listByTask() {
        return notImplemented('designTaskPlans.listByTask');
      },
      async insert() {
        return notImplemented('designTaskPlans.insert');
      },
      async update() {
        return notImplemented('designTaskPlans.update');
      },
    },
    procurementTaskPlans: {
      async listByTask() {
        return notImplemented('procurementTaskPlans.listByTask');
      },
      async insert() {
        return notImplemented('procurementTaskPlans.insert');
      },
      async update() {
        return notImplemented('procurementTaskPlans.update');
      },
    },
    vendorTaskPlans: {
      async listByTask() {
        return notImplemented('vendorTaskPlans.listByTask');
      },
      async insert() {
        return notImplemented('vendorTaskPlans.insert');
      },
      async update() {
        return notImplemented('vendorTaskPlans.update');
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
      async insert() {
        return notImplemented('taskConfirmations.insert');
      },
      async insertSnapshot() {
        return notImplemented('taskConfirmations.insertSnapshot');
      },
    },
  };
}
