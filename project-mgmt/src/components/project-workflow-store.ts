import type {
  AssignmentReply,
  DesignAssignmentDraft,
  ProcurementAssignmentDraft,
  VendorAssignmentDraft,
} from "@/components/execution-tree";
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
import {
  type CostLineItem,
  quoteCostProjects,
  type QuoteCostProject,
} from "@/components/quote-cost-data";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import type { Project } from "@/components/project-data";

const TREE_STORAGE_PREFIX = "projectflow-execution-tree:";
const SECTION_STORAGE_PREFIX = "projectflow-execution-section:";

export type StoredExecutionTreeState = {
  savedDesignAssignments: Record<string, DesignAssignmentDraft>;
  savedProcurementAssignments: Record<string, ProcurementAssignmentDraft>;
  savedVendorAssignments: Record<string, VendorAssignmentDraft>;
};

export type StoredExecutionSectionState = {
  replyOverrides: Record<string, AssignmentReply[]>;
  generatedDesignDocuments: Record<string, number>;
  generatedProcurementDocuments: Record<string, number>;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function getExecutionTreeStorageKey(projectId: string) {
  return `${TREE_STORAGE_PREFIX}${projectId}`;
}

export function getExecutionSectionStorageKey(projectId: string) {
  return `${SECTION_STORAGE_PREFIX}${projectId}`;
}

export function readStoredExecutionTreeState(projectId: string): StoredExecutionTreeState {
  return readJson<StoredExecutionTreeState>(getExecutionTreeStorageKey(projectId), {
    savedDesignAssignments: {},
    savedProcurementAssignments: {},
    savedVendorAssignments: {},
  });
}

export function readStoredExecutionSectionState(projectId: string): StoredExecutionSectionState {
  return readJson<StoredExecutionSectionState>(getExecutionSectionStorageKey(projectId), {
    replyOverrides: {},
    generatedDesignDocuments: {},
    generatedProcurementDocuments: {},
  });
}

function parseReplyMessage(reply: AssignmentReply) {
  const lines = reply.message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const getValue = (label: string) => {
    for (const line of lines) {
      const parts = line.split("｜").map((part) => part.trim());
      for (const part of parts) {
        if (part.startsWith(`${label}：`)) {
          return part.slice(label.length + 1).trim();
        }
      }
    }
    return "";
  };

  return {
    title: getValue("回覆標題") || getValue("項目") || "未命名回覆",
    amount: getValue("金額") || "",
    quantity: getValue("數量") || "未填寫",
    size: getValue("尺寸") || "未填寫",
    material:
      getValue("材質 + 結構") || getValue("材質") || "未填寫",
    fileUrl: getValue("檔案位置（URL）") || getValue("預覽圖 URL") || "未填寫",
    vendor: getValue("執行廠商") || getValue("廠商") || "未指定廠商",
    confirmed: /\[已確認金額\]/.test(reply.message),
  };
}

function parseCurrency(value: string) {
  const numeric = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getDesignBoardRecords(projects: Project[]): DesignTaskBoardRecord[] {
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

    return entries.map(([targetId, assignment], index) => {
      const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
      const confirmed = replies.filter((reply) => parseReplyMessage(reply).confirmed);
      const latestConfirmed = confirmed[confirmed.length - 1];
      const latestParsed = latestConfirmed ? parseReplyMessage(latestConfirmed) : null;
      const confirmStatus: DesignConfirmStatus = replies.length === 0 ? "尚無回覆" : confirmed.length > 0 ? "已確認" : "待確認";
      const vendorName = latestParsed?.vendor || assignment.outsourceTarget || "未指定";
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
        title: assignment.note || assignment.assignee ? project.executionItems.find((item) => item.id === targetId)?.title ?? targetId : targetId,
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

export function getProcurementBoardRecords(projects: Project[]): ProcurementBoardRecord[] {
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
        note: `此處為 ${title} 的 mock 原始需求說明，後續會接正式資料。`,
        referenceUrl: "https://example.com/procurement-reference",
        plans: [
          {
            id: `${project.id}-${targetId}-plan-a`,
            title: "主採購方案",
            quantity,
            amount: costLabel,
            previewUrl: "https://example.com/procurement-preview-a",
            vendor: vendorName,
          },
          {
            id: `${project.id}-${targetId}-plan-b`,
            title: "替代採購方案",
            quantity,
            amount: costLabel,
            previewUrl: "https://example.com/procurement-preview-b",
            vendor: vendorName,
          },
        ],
        documentRows: [
          { id: 1, item: title, quantity },
          { id: 2, item: `${title} 備案項目`, quantity },
        ],
      };
    });
  });
}

function buildWorkflowCostItems(projectId: string): CostLineItem[] {
  if (typeof window === "undefined") return [];

  const tree = readStoredExecutionTreeState(projectId);
  const section = readStoredExecutionSectionState(projectId);
  const items: CostLineItem[] = [];

  Object.entries(tree.savedDesignAssignments).forEach(([targetId, assignment]) => {
    const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
    replies.forEach((reply) => {
      const parsed = parseReplyMessage(reply);
      if (!parsed.confirmed) return;
      const amount = parseCurrency(parsed.amount);
      items.push({
        id: `workflow-design-${projectId}-${targetId}-${reply.id}`,
        itemName: parsed.title,
        sourceType: "設計",
        sourceRef: `設計文件整理 / ${parsed.vendor}`,
        vendorId: null,
        vendorName: parsed.vendor === "未指定廠商" ? null : parsed.vendor,
        originalAmount: amount,
        adjustedAmount: amount,
        includedInCost: true,
        isManual: false,
      });
    });
  });

  Object.entries(tree.savedProcurementAssignments).forEach(([targetId, assignment]) => {
    const replies = section.replyOverrides[targetId] ?? assignment.replies ?? [];
    replies.forEach((reply) => {
      const parsed = parseReplyMessage(reply);
      if (!parsed.confirmed) return;
      const amount = parseCurrency(parsed.amount);
      items.push({
        id: `workflow-procurement-${projectId}-${targetId}-${reply.id}`,
        itemName: parsed.title,
        sourceType: "備品",
        sourceRef: `備品整理 / ${parsed.vendor}`,
        vendorId: null,
        vendorName: parsed.vendor === "未指定廠商" ? null : parsed.vendor,
        originalAmount: amount,
        adjustedAmount: amount,
        includedInCost: true,
        isManual: false,
      });
    });
  });

  const vendorAssignments = tree.savedVendorAssignments;
  const packages = getStoredPackagesByProjectId(projectId);
  packages.forEach((pkg) => {
    pkg.items.forEach((item) => {
      const assignment = vendorAssignments[item.assignmentId];
      const amount = parseCurrency(assignment?.amount || "");
      items.push({
        id: `workflow-vendor-${pkg.id}-${item.assignmentId}`,
        itemName: item.itemName,
        sourceType: "廠商",
        sourceRef: `廠商發包清單 / ${pkg.vendorName}`,
        vendorId: null,
        vendorName: pkg.vendorName || null,
        originalAmount: amount,
        adjustedAmount: amount,
        includedInCost: true,
        isManual: false,
      });
    });
  });

  return items;
}

export function getQuoteCostProjectsWithWorkflow(): QuoteCostProject[] {
  if (typeof window === "undefined") return quoteCostProjects;

  return quoteCostProjects.map((project) => {
    const workflowItems = buildWorkflowCostItems(project.id);
    if (!workflowItems.length) return project;

    const workflowSourceTypes = new Set(workflowItems.map((item) => item.sourceType));
    const preservedSeedItems = project.costItems.filter((item) => item.isManual || !workflowSourceTypes.has(item.sourceType));

    return {
      ...project,
      costItems: [...preservedSeedItems, ...workflowItems],
    };
  });
}
