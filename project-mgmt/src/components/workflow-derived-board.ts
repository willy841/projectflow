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

function getMockFormalReadbackRowsFromProjects(projects: Project[]): ProjectFlowFormalReadbackRow[] {
  if (typeof window === "undefined") return [];

  return projects.flatMap((project) => {
    const tree = readStoredExecutionTreeState(project.id);
    const section = readStoredExecutionSectionState(project.id);

    const designEntries = Object.entries(tree.savedDesignAssignments);
    const procurementEntries = Object.entries(tree.savedProcurementAssignments);

    const designConfirmedReplies = new Map<string, number>();
    designEntries.forEach(([, assignment]) => {
      const replies = assignment.replies ?? [];
      replies.forEach((reply) => {
        const parsed = parseReplyMessage(reply);
        if (!parsed.confirmed) return;
        const vendor = parsed.vendor || "未指定廠商";
        designConfirmedReplies.set(vendor, (designConfirmedReplies.get(vendor) ?? 0) + 1);
      });
    });

    const designRows: ProjectFlowFormalReadbackRow[] = designEntries.map(([targetId, assignment]) => {
      const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
      const confirmed = replies.filter((reply) => parseReplyMessage(reply).confirmed);
      const latestConfirmed = confirmed[confirmed.length - 1];
      const latestParsed = latestConfirmed ? parseReplyMessage(latestConfirmed) : null;
      const confirmationStatus: ProjectFlowFormalReadbackRow["confirmationStatus"] = replies.length === 0 ? "尚無回覆" : confirmed.length > 0 ? "已確認" : "待確認";
      const vendorName = latestParsed?.vendor || "未指定";
      const generatedCount = section.generatedDesignDocuments[vendorName] ?? 0;
      const expectedDocumentCount = designConfirmedReplies.get(vendorName) ?? 0;
      const documentStatus: ProjectFlowFormalReadbackRow["documentStatus"] =
        confirmationStatus !== "已確認"
          ? "未生成"
          : generatedCount === 0
            ? "未生成"
            : generatedCount === expectedDocumentCount
              ? "已生成"
              : "需更新";

      return {
        flowType: "design",
        projectId: project.id,
        taskId: targetId,
        sourceExecutionItemId: targetId,
        projectName: project.name,
        taskTitle: assignment.requirement || assignment.assignee ? project.executionItems.find((item) => item.id === targetId)?.title ?? targetId : targetId,
        assignee: assignment.assignee || null,
        requirementText: assignment.requirement || null,
        quantityText: null,
        sizeText: assignment.size || null,
        materialText: assignment.material || null,
        referenceUrl: null,
        latestConfirmationId: latestConfirmed?.id ?? null,
        latestConfirmationNo: confirmed.length || null,
        confirmationStatus,
        latestConfirmedVendorName: latestParsed?.vendor || null,
        latestConfirmedAmountLabel: latestParsed?.amount || null,
        latestConfirmedAmountValue: latestParsed ? parseCurrency(latestParsed.amount) : null,
        confirmedReplyCount: confirmed.length,
        totalReplyCount: replies.length,
        documentStatus,
        generatedDocumentCount: generatedCount,
        expectedDocumentCount,
        costLocked: confirmationStatus === "已確認",
        includeInCost: confirmationStatus === "已確認",
      };
    });

    const procurementRows: ProjectFlowFormalReadbackRow[] = procurementEntries.map(([targetId, assignment]) => {
      const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
      const confirmed = replies.filter((reply) => parseReplyMessage(reply).confirmed);
      const latestConfirmed = confirmed[confirmed.length - 1];
      const latestParsed = latestConfirmed ? parseReplyMessage(latestConfirmed) : null;
      const confirmationStatus: ProjectFlowFormalReadbackRow["confirmationStatus"] = replies.length === 0 ? "尚無回覆" : confirmed.length > 0 ? "已確認" : "待確認";
      const generatedCount = section.generatedProcurementDocuments[project.id] ?? 0;
      const expectedDocumentCount = confirmed.length;
      const documentStatus: ProjectFlowFormalReadbackRow["documentStatus"] =
        confirmationStatus !== "已確認"
          ? "未生成"
          : generatedCount === 0
            ? "未生成"
            : generatedCount === expectedDocumentCount
              ? "已生成"
              : "需更新";

      return {
        flowType: "procurement",
        projectId: project.id,
        taskId: targetId,
        sourceExecutionItemId: targetId,
        projectName: project.name,
        taskTitle: assignment.item || project.executionItems.find((item) => item.id === targetId)?.title || targetId,
        assignee: null,
        requirementText: assignment.requirement || null,
        quantityText: assignment.quantity || null,
        sizeText: assignment.size || null,
        materialText: assignment.material || null,
        referenceUrl: assignment.styleUrl || null,
        latestConfirmationId: latestConfirmed?.id ?? null,
        latestConfirmationNo: confirmed.length || null,
        confirmationStatus,
        latestConfirmedVendorName: latestParsed?.vendor || null,
        latestConfirmedAmountLabel: latestParsed?.amount || null,
        latestConfirmedAmountValue: latestParsed ? parseCurrency(latestParsed.amount) : null,
        confirmedReplyCount: confirmed.length,
        totalReplyCount: replies.length,
        documentStatus,
        generatedDocumentCount: generatedCount,
        expectedDocumentCount,
        costLocked: confirmationStatus === "已確認",
        includeInCost: confirmationStatus === "已確認",
      };
    });

    return [...designRows, ...procurementRows];
  });
}

export function getDesignBoardRecordsForReadback(projects: Project[]): DesignTaskBoardRecord[] {
  if (typeof window === "undefined") return designTaskBoardRecords;

  const formalRows = getMockFormalReadbackRowsFromProjects(projects);
  if (!formalRows.length) {
    return projects.flatMap((project) => designTaskBoardRecords.filter((record) => record.projectId === project.id));
  }

  return mapFormalRowsToDesignBoardRecords(formalRows);
}

export function getProcurementBoardRecordsForReadback(projects: Project[]): ProcurementBoardRecord[] {
  if (typeof window === "undefined") return procurementTaskBoardRecords;

  const formalRows = getMockFormalReadbackRowsFromProjects(projects);
  if (!formalRows.length) {
    return projects.flatMap((project) => procurementTaskBoardRecords.filter((record) => record.projectId === project.id));
  }

  return mapFormalRowsToProcurementBoardRecords(formalRows);
}
