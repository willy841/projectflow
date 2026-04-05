export type UUID = string;
export type TimestampString = string;
export type ISODateString = string;
export type FlowType = 'design' | 'procurement' | 'vendor';

export interface BaseRow {
  id: UUID;
  created_at: TimestampString;
}

export interface BaseMutableRow extends BaseRow {
  updated_at: TimestampString;
}

export interface ProjectRow extends BaseMutableRow {
  code: string;
  name: string;
  client_name: string | null;
  event_date: ISODateString | null;
  location: string | null;
  load_in_time: string | null;
  status: string;
}

export interface VendorRow extends BaseMutableRow {
  name: string;
  normalized_name: string;
}

export interface ProjectExecutionItemRow extends BaseMutableRow {
  project_id: UUID;
  parent_id: UUID | null;
  seq_code: string;
  title: string;
  size: string | null;
  material: string | null;
  structure: string | null;
  quantity: string | null;
  note: string | null;
  sort_order: number;
}

export interface DesignTaskRow extends BaseMutableRow {
  project_id: UUID;
  source_execution_item_id: UUID;
  title: string;
  size: string | null;
  material: string | null;
  structure: string | null;
  quantity: string | null;
  requirement_text: string | null;
  reference_url: string | null;
  status: string;
}

export interface ProcurementTaskRow extends BaseMutableRow {
  project_id: UUID;
  source_execution_item_id: UUID;
  title: string;
  quantity: string | null;
  budget_note: string | null;
  requirement_text: string | null;
  reference_url: string | null;
  status: string;
}

export interface VendorTaskRow extends BaseMutableRow {
  project_id: UUID;
  source_execution_item_id: UUID;
  vendor_id: UUID;
  title: string;
  requirement_text: string | null;
  status: string;
}

export interface DesignTaskPlanRow extends BaseMutableRow {
  design_task_id: UUID;
  title: string;
  size: string | null;
  material: string | null;
  structure: string | null;
  quantity: string | null;
  amount: string | null;
  preview_url: string | null;
  vendor_name_text: string | null;
  sort_order: number;
}

export interface ProcurementTaskPlanRow extends BaseMutableRow {
  procurement_task_id: UUID;
  title: string;
  quantity: string | null;
  amount: string | null;
  preview_url: string | null;
  vendor_name_text: string | null;
  sort_order: number;
}

export interface VendorTaskPlanRow extends BaseMutableRow {
  vendor_task_id: UUID;
  title: string;
  requirement_text: string | null;
  amount: string | null;
  sort_order: number;
}

export interface TaskConfirmationRow extends BaseRow {
  project_id: UUID;
  flow_type: FlowType;
  task_id: UUID;
  confirmation_no: number;
  status: string;
  confirmed_at: TimestampString;
}

export interface TaskConfirmationPlanSnapshotRow extends BaseRow {
  task_confirmation_id: UUID;
  source_plan_id: UUID | null;
  sort_order: number;
  payload_json: Record<string, unknown>;
}

export interface TaskConfirmationPlanPayloadByFlow {
  design: {
    title: string;
    size: string | null;
    material: string | null;
    structure: string | null;
    quantity: string | null;
    amount: string | null;
    preview_url: string | null;
    vendor_name_text: string | null;
  };
  procurement: {
    title: string;
    quantity: string | null;
    amount: string | null;
    preview_url: string | null;
    vendor_name_text: string | null;
  };
  vendor: {
    title: string;
    requirement_text: string | null;
    amount: string | null;
  };
}

export type TaskConfirmationSnapshotPayload<TFlow extends FlowType> =
  TaskConfirmationPlanPayloadByFlow[TFlow];

export interface Phase1DatabaseSchema {
  projects: ProjectRow;
  vendors: VendorRow;
  project_execution_items: ProjectExecutionItemRow;
  design_tasks: DesignTaskRow;
  procurement_tasks: ProcurementTaskRow;
  vendor_tasks: VendorTaskRow;
  design_task_plans: DesignTaskPlanRow;
  procurement_task_plans: ProcurementTaskPlanRow;
  vendor_task_plans: VendorTaskPlanRow;
  task_confirmations: TaskConfirmationRow;
  task_confirmation_plan_snapshots: TaskConfirmationPlanSnapshotRow;
}
