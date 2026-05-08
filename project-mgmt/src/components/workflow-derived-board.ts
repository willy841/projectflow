import type {
  DesignTaskBoardRecord,
  ConfirmStatus as DesignConfirmStatus,
  DocumentStatus as DesignDocumentStatus,
} from "@/components/design-task-board-data";
import type {
  ProcurementBoardRecord,
  ConfirmStatus as ProcurementConfirmStatus,
  DocumentStatus as ProcurementDocumentStatus,
} from "@/components/procurement-task-board-data";

export const workflowDerivedBoardBoundary = {
  mode: "formal-row-board-record-mapper",
  sources: ["formal-readback-rows-only"],
  consumerScope: ["board-record-mapper-only"],
  exportSurface: [
    "getDesignBoardRecordsForReadback",
    "getProcurementBoardRecordsForReadback",
    "mapFormalRowsToDesignBoardRecords",
    "mapFormalRowsToProcurementBoardRecords",
  ],
  formalMapperStatus: "extracted-and-active",
  runtimeSourceStatus: "no-local-runtime-readback-path",
  liveDbAdoptionStatus: "handled-upstream",
} as const;

export type ProjectFlowFormalReadbackRow = {
  flowType: "design" | "procurement";
  projectId: string;
  taskId: string;
  sourceExecutionItemId: string | null;
  projectName: string;
  taskTitle: string;
  assignee: string | null;
  requirementText: string | null;
  quantityText: string | null;
  sizeText: string | null;
  materialText: string | null;
  referenceUrl: string | null;
  latestConfirmationId: string | null;
  latestConfirmationNo: number | null;
  confirmationStatus: "尚無回覆" | "待確認" | "已確認";
  latestConfirmedVendorName: string | null;
  latestConfirmedAmountLabel: string | null;
  latestConfirmedAmountValue: number | null;
  confirmedReplyCount: number;
  totalReplyCount: number;
  documentStatus: "未生成" | "已生成" | "需更新";
  generatedDocumentCount: number;
  expectedDocumentCount: number;
  costLocked: boolean;
  includeInCost: boolean;
};

export function mapFormalRowsToDesignBoardRecords(rows: ProjectFlowFormalReadbackRow[]): DesignTaskBoardRecord[] {
  return rows
    .filter((row) => row.flowType === "design")
    .map((row) => ({
      id: `${row.projectId}-${row.taskId}`,
      projectId: row.projectId,
      projectName: row.projectName,
      title: row.taskTitle,
      size: row.sizeText ?? "未填寫",
      material: row.materialText ?? "未填寫",
      replyCount: row.totalReplyCount,
      confirmStatus: row.confirmationStatus as DesignConfirmStatus,
      documentStatus: row.documentStatus as DesignDocumentStatus,
      vendorName: row.latestConfirmedVendorName ?? "未指定",
      costLabel: row.latestConfirmedAmountLabel ?? "待確認後成立",
      costAmount: row.latestConfirmedAmountValue ?? 0,
      costLocked: row.costLocked,
    }));
}

export function mapFormalRowsToProcurementBoardRecords(rows: ProjectFlowFormalReadbackRow[]): ProcurementBoardRecord[] {
  return rows
    .filter((row) => row.flowType === "procurement")
    .map((row) => ({
      id: `${row.projectId}-${row.taskId}`,
      projectId: row.projectId,
      projectName: row.projectName,
      title: row.taskTitle,
      size: row.sizeText ?? "未填寫",
      material: row.materialText ?? "未填寫",
      quantity: row.quantityText ?? "未填寫",
      replyCount: row.totalReplyCount,
      confirmStatus: row.confirmationStatus as ProcurementConfirmStatus,
      documentStatus: row.documentStatus as ProcurementDocumentStatus,
      vendorName: row.latestConfirmedVendorName ?? "未指定",
      costLabel: row.latestConfirmedAmountLabel ?? "待確認後成立",
      costAmount: row.latestConfirmedAmountValue ?? 0,
      costLocked: row.costLocked,
      note: row.requirementText ?? "",
      referenceUrl: row.referenceUrl ?? "",
      plans: [],
      documentRows: [],
    }));
}

export function getDesignBoardRecordsForReadback(rows: ProjectFlowFormalReadbackRow[]): DesignTaskBoardRecord[] {
  return mapFormalRowsToDesignBoardRecords(rows);
}

export function getProcurementBoardRecordsForReadback(rows: ProjectFlowFormalReadbackRow[]): ProcurementBoardRecord[] {
  return mapFormalRowsToProcurementBoardRecords(rows);
}
