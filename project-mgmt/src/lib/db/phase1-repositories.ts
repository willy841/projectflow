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
  throw new Error(`${name} is not implemented yet. Wire SQL execution after DB runtime client is chosen.`);
}

export function createPhase1Repositories(_db: Phase1DbClient): Phase1Repositories {
  void _db;
  return {
    projects: {
      async findById() {
        return notImplemented('projects.findById');
      },
      async list() {
        return notImplemented('projects.list');
      },
      async insert() {
        return notImplemented('projects.insert');
      },
      async update() {
        return notImplemented('projects.update');
      },
    },
    vendors: {
      async findById() {
        return notImplemented('vendors.findById');
      },
      async findByNormalizedName() {
        return notImplemented('vendors.findByNormalizedName');
      },
      async list() {
        return notImplemented('vendors.list');
      },
      async insert() {
        return notImplemented('vendors.insert');
      },
      async update() {
        return notImplemented('vendors.update');
      },
    },
    executionItems: {
      async listByProject() {
        return notImplemented('executionItems.listByProject');
      },
      async insert() {
        return notImplemented('executionItems.insert');
      },
      async update() {
        return notImplemented('executionItems.update');
      },
    },
    designTasks: {
      async listByProject() {
        return notImplemented('designTasks.listByProject');
      },
      async findById() {
        return notImplemented('designTasks.findById');
      },
      async insert() {
        return notImplemented('designTasks.insert');
      },
      async update() {
        return notImplemented('designTasks.update');
      },
    },
    procurementTasks: {
      async listByProject() {
        return notImplemented('procurementTasks.listByProject');
      },
      async findById() {
        return notImplemented('procurementTasks.findById');
      },
      async insert() {
        return notImplemented('procurementTasks.insert');
      },
      async update() {
        return notImplemented('procurementTasks.update');
      },
    },
    vendorTasks: {
      async listByProject() {
        return notImplemented('vendorTasks.listByProject');
      },
      async listByProjectAndVendor() {
        return notImplemented('vendorTasks.listByProjectAndVendor');
      },
      async findById() {
        return notImplemented('vendorTasks.findById');
      },
      async insert() {
        return notImplemented('vendorTasks.insert');
      },
      async update() {
        return notImplemented('vendorTasks.update');
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
      async listByTask() {
        return notImplemented('taskConfirmations.listByTask');
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

export type Phase1RepositoryRow = QueryResultRow;
