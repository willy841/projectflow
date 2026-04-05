import type {
  DesignTaskPlanRow,
  DesignTaskRow,
  FlowType,
  ProcurementTaskPlanRow,
  ProcurementTaskRow,
  ProjectExecutionItemRow,
  ProjectRow,
  TaskConfirmationPlanPayloadByFlow,
  TaskConfirmationRow,
  VendorRow,
  VendorTaskPlanRow,
  VendorTaskRow,
} from '@/lib/db/phase1-types';

export type InsertProjectInput = Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProjectInput = Partial<InsertProjectInput>;

export type InsertVendorInput = Omit<VendorRow, 'id' | 'created_at' | 'updated_at'>;
export type UpdateVendorInput = Partial<InsertVendorInput>;

export type InsertProjectExecutionItemInput = Omit<
  ProjectExecutionItemRow,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateProjectExecutionItemInput = Partial<InsertProjectExecutionItemInput>;

export type InsertDesignTaskInput = Omit<DesignTaskRow, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDesignTaskInput = Partial<InsertDesignTaskInput>;

export type InsertProcurementTaskInput = Omit<
  ProcurementTaskRow,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateProcurementTaskInput = Partial<InsertProcurementTaskInput>;

export type InsertVendorTaskInput = Omit<VendorTaskRow, 'id' | 'created_at' | 'updated_at'>;
export type UpdateVendorTaskInput = Partial<InsertVendorTaskInput>;

export type InsertDesignTaskPlanInput = Omit<
  DesignTaskPlanRow,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateDesignTaskPlanInput = Partial<InsertDesignTaskPlanInput>;

export type InsertProcurementTaskPlanInput = Omit<
  ProcurementTaskPlanRow,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateProcurementTaskPlanInput = Partial<InsertProcurementTaskPlanInput>;

export type InsertVendorTaskPlanInput = Omit<
  VendorTaskPlanRow,
  'id' | 'created_at' | 'updated_at'
>;
export type UpdateVendorTaskPlanInput = Partial<InsertVendorTaskPlanInput>;

export type InsertTaskConfirmationInput = Omit<
  TaskConfirmationRow,
  'id' | 'created_at' | 'confirmed_at'
> & {
  confirmed_at?: string;
};

export type InsertTaskConfirmationPlanSnapshotInput<TFlow extends FlowType> = {
  task_confirmation_id: string;
  source_plan_id: string | null;
  sort_order: number;
  payload_json: TaskConfirmationPlanPayloadByFlow[TFlow];
};
