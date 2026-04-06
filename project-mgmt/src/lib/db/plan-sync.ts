import type {
  InsertDesignTaskPlanInput,
  InsertProcurementTaskPlanInput,
  InsertVendorTaskPlanInput,
  UpdateDesignTaskPlanInput,
  UpdateProcurementTaskPlanInput,
  UpdateVendorTaskPlanInput,
} from '@/lib/db/phase1-inputs';
import type {
  DesignTaskPlanRow,
  ProcurementTaskPlanRow,
  VendorTaskPlanRow,
} from '@/lib/db/phase1-types';

export type DesignPlanSyncInput = {
  id?: string;
} & InsertDesignTaskPlanInput;

export type ProcurementPlanSyncInput = {
  id?: string;
} & InsertProcurementTaskPlanInput;

export type VendorPlanSyncInput = {
  id?: string;
} & InsertVendorTaskPlanInput;

export type PlanSyncSummary<TRow> = {
  rows: TRow[];
  inserted: number;
  updated: number;
  deleted: number;
  kept: number;
};

export function diffDesignPlans(
  existingRows: DesignTaskPlanRow[],
  nextInputs: DesignPlanSyncInput[],
): {
  inserts: InsertDesignTaskPlanInput[];
  updates: Array<{ id: string; input: UpdateDesignTaskPlanInput }>;
  deleteIds: string[];
  keptIds: string[];
} {
  return diffPlans<DesignTaskPlanRow, DesignPlanSyncInput, InsertDesignTaskPlanInput, UpdateDesignTaskPlanInput>(
    existingRows,
    nextInputs,
    getComparableDesignValues,
  );
}

export function diffProcurementPlans(
  existingRows: ProcurementTaskPlanRow[],
  nextInputs: ProcurementPlanSyncInput[],
): {
  inserts: InsertProcurementTaskPlanInput[];
  updates: Array<{ id: string; input: UpdateProcurementTaskPlanInput }>;
  deleteIds: string[];
  keptIds: string[];
} {
  return diffPlans<
    ProcurementTaskPlanRow,
    ProcurementPlanSyncInput,
    InsertProcurementTaskPlanInput,
    UpdateProcurementTaskPlanInput
  >(existingRows, nextInputs, getComparableProcurementValues);
}

export function diffVendorPlans(
  existingRows: VendorTaskPlanRow[],
  nextInputs: VendorPlanSyncInput[],
): {
  inserts: InsertVendorTaskPlanInput[];
  updates: Array<{ id: string; input: UpdateVendorTaskPlanInput }>;
  deleteIds: string[];
  keptIds: string[];
} {
  return diffPlans<VendorTaskPlanRow, VendorPlanSyncInput, InsertVendorTaskPlanInput, UpdateVendorTaskPlanInput>(
    existingRows,
    nextInputs,
    getComparableVendorValues,
  );
}

function diffPlans<
  TRow extends { id: string },
  TInput extends { id?: string },
  TInsertInput,
  TUpdateInput,
>(
  existingRows: TRow[],
  nextInputs: TInput[],
  getComparableValues: (value: TRow | TInput) => Record<string, unknown>,
): {
  inserts: TInsertInput[];
  updates: Array<{ id: string; input: TUpdateInput }>;
  deleteIds: string[];
  keptIds: string[];
} {
  const existingById = new Map(existingRows.map((row) => [row.id, row]));
  const nextIds = new Set(nextInputs.map((input) => input.id).filter((id): id is string => Boolean(id)));

  const inserts: TInsertInput[] = [];
  const updates: Array<{ id: string; input: TUpdateInput }> = [];
  const keptIds: string[] = [];

  for (const input of nextInputs) {
    if (!input.id || !existingById.has(input.id)) {
      const insertInput = { ...(input as TInput & Record<string, unknown>) };
      delete insertInput.id;
      inserts.push(insertInput as TInsertInput);
      continue;
    }

    const existing = existingById.get(input.id)!;
    const comparableExisting = getComparableValues(existing);
    const comparableNext = getComparableValues(input);

    if (isSameComparableValue(comparableExisting, comparableNext)) {
      keptIds.push(input.id);
      continue;
    }

    const { id: updateId, ...updateInput } = input as TInput & Record<string, unknown>;
    updates.push({ id: updateId!, input: updateInput as TUpdateInput });
  }

  const deleteIds = existingRows
    .filter((row) => !nextIds.has(row.id))
    .map((row) => row.id);

  return { inserts, updates, deleteIds, keptIds };
}

function isSameComparableValue(left: Record<string, unknown>, right: Record<string, unknown>) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[key] === right[key]);
}

function getComparableDesignValues(
  value: DesignTaskPlanRow | DesignPlanSyncInput,
): Record<string, unknown> {
  return {
    design_task_id: value.design_task_id,
    title: value.title,
    size: value.size ?? null,
    material: value.material ?? null,
    structure: value.structure ?? null,
    quantity: value.quantity ?? null,
    amount: value.amount ?? null,
    preview_url: value.preview_url ?? null,
    vendor_name_text: value.vendor_name_text ?? null,
    sort_order: value.sort_order,
  };
}

function getComparableProcurementValues(
  value: ProcurementTaskPlanRow | ProcurementPlanSyncInput,
): Record<string, unknown> {
  return {
    procurement_task_id: value.procurement_task_id,
    title: value.title,
    quantity: value.quantity ?? null,
    amount: value.amount ?? null,
    preview_url: value.preview_url ?? null,
    vendor_name_text: value.vendor_name_text ?? null,
    sort_order: value.sort_order,
  };
}

function getComparableVendorValues(
  value: VendorTaskPlanRow | VendorPlanSyncInput,
): Record<string, unknown> {
  return {
    vendor_task_id: value.vendor_task_id,
    title: value.title,
    requirement_text: value.requirement_text ?? null,
    amount: value.amount ?? null,
    sort_order: value.sort_order,
  };
}
