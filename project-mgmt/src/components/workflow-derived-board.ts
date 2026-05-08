import {
  designTaskBoardRecords,
  type DesignTaskBoardRecord,
  type ConfirmStatus as DesignConfirmStatus,
  type DocumentStatus as DesignDocumentStatus,
} from "@/components/design-task-board-data";
import {
  procurementTaskBoardRecords,
  type ProcurementBoardRecord,
  type ConfirmStatus as ProcurementConfirmStatus,
  type DocumentStatus as ProcurementDocumentStatus,
} from "@/components/procurement-task-board-data";
import type { Project } from "@/components/project-data";
import { readStoredExecutionSectionState, readStoredExecutionTreeState } from "@/components/workflow-local-storage";
import { parseCurrency, parseReplyMessage } from "@/components/workflow-reply-parser";

export const workflowDerivedBoardBoundary = {
  mode: "local-execution-readback-projection-bridge",
  sources: ["workflow-local-storage", "design-task-board-fixture", "procurement-task-board-fixture"],
  consumerScope: ["design-board-readback", "procurement-board-readback"],
  exportSurface: [
    "getDesignBoardRecordsForReadback",
    "getProcurementBoardRecordsForReadback",
    "mapFormalRowsToDesignBoardRecords",
    "mapFormalRowsToProcurementBoardRecords",
  ],
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

export function getDesignBoardRecordsForReadback(projects: Project[]): DesignTaskBoardRecord[] {
  if (typeof window === "undefined") return designTaskBoardRecords;

  const records = projects.flatMap((project) => {
    const tree = readStoredExecutionTreeState(project.id);
    const section = readStoredExecutionSectionState(project.id);
    const entries = Object.entries(tree.savedDesignAssignments);

    if (!entries.length) {
      return designTaskBoardRecords.filter((record) => record.projectId === project.id);
    }

    const confirmedReplies = new Map<string, number>();
    entries.forEach(([, assignment]) => {
      const replies = assignment.replies ?? [];
      replies.forEach((reply) => {
        const parsed = parseReplyMessage(reply);
        if (!parsed.confirmed) return;
        const vendor = parsed.vendor || "未指定廠商";
        confirmedReplies.set(vendor, (confirmedReplies.get(vendor) ?? 0) + 1);
      });
    });

    return entries.map(([targetId, assignment]) => {
      const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
      const confirmed = replies.filter((reply) => parseReplyMessage(reply).confirmed);
      const latestConfirmed = confirmed[confirmed.length - 1];
      const latestParsed = latestConfirmed ? parseReplyMessage(latestConfirmed) : null;
      const confirmStatus: DesignConfirmStatus = replies.length === 0 ? "尚無回覆" : confirmed.length > 0 ? "已確認" : "待確認";
      const vendorName = latestParsed?.vendor || "未指定";
      const generatedCount = section.generatedDesignDocuments[vendorName] ?? 0;
      const totalConfirmedForVendor = confirmedReplies.get(vendorName) ?? 0;
      const documentStatus: DesignDocumentStatus =
        confirmStatus !== "已確認"
          ? "未生成"
          : generatedCount === 0
            ? "未生成"
            : generatedCount === totalConfirmedForVendor
              ? "已生成"
              : "需更新";
      const costAmount = latestParsed ? parseCurrency(latestParsed.amount) : 0;

      return {
        id: `${project.id}-${targetId}`,
        projectId: project.id,
        projectName: project.name,
        title: assignment.requirement || assignment.assignee ? project.executionItems.find((item) => item.id === targetId)?.title ?? targetId : targetId,
        size: assignment.size || "未填寫",
        material: assignment.material || "未填寫",
        replyCount: replies.length,
        confirmStatus,
        documentStatus,
        vendorName,
        costLabel: latestParsed?.amount || "待確認後成立",
        costAmount,
        costLocked: confirmStatus === "已確認",
      };
    });
  });

  return records;
}

export function getProcurementBoardRecordsForReadback(projects: Project[]): ProcurementBoardRecord[] {
  if (typeof window === "undefined") return procurementTaskBoardRecords;

  return projects.flatMap((project) => {
    const tree = readStoredExecutionTreeState(project.id);
    const section = readStoredExecutionSectionState(project.id);
    const entries = Object.entries(tree.savedProcurementAssignments);

    if (!entries.length) {
      return procurementTaskBoardRecords.filter((record) => record.projectId === project.id);
    }

    return entries.map(([targetId, assignment]) => {
      const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
      const confirmed = replies.filter((reply) => parseReplyMessage(reply).confirmed);
      const latestConfirmed = confirmed[confirmed.length - 1];
      const latestParsed = latestConfirmed ? parseReplyMessage(latestConfirmed) : null;
      const confirmStatus: ProcurementConfirmStatus = replies.length === 0 ? "尚無回覆" : confirmed.length > 0 ? "已確認" : "待確認";
      const generatedCount = section.generatedProcurementDocuments[project.id] ?? 0;
      const documentStatus: ProcurementDocumentStatus =
        confirmStatus !== "已確認"
          ? "未生成"
          : generatedCount === 0
            ? "未生成"
            : generatedCount === confirmed.length
              ? "已生成"
              : "需更新";

      const title = assignment.item || project.executionItems.find((item) => item.id === targetId)?.title || targetId;
      const quantity = assignment.quantity || "未填寫";
      const vendorName = latestParsed?.vendor || "未指定";
      const costLabel = latestParsed?.amount || "待確認後成立";

      return {
        id: `${project.id}-${targetId}`,
        projectId: project.id,
        projectName: project.name,
        title,
        size: assignment.size || "未填寫",
        material: assignment.material || "未填寫",
        quantity,
        replyCount: replies.length,
        confirmStatus,
        documentStatus,
        vendorName,
        costLabel,
        costAmount: latestParsed ? parseCurrency(latestParsed.amount) : 0,
        costLocked: confirmStatus === "已確認",
        note: assignment.requirement || "",
        referenceUrl: assignment.styleUrl || "",
        plans: [],
        documentRows: [],
      };
    });
  });
}
