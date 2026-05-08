import type { CostLineItem, QuoteCostProject } from "@/components/quote-cost-data";
import { quoteCostProjects } from "@/components/quote-cost-data";
import type { ProjectFlowFormalReadbackRow } from "@/components/workflow-derived-board";
import { getVendorPackagesForWorkflowProject } from "@/components/workflow-vendor-package-bridge";
import { readStoredExecutionSectionState, readStoredExecutionTreeState } from "@/components/workflow-local-storage";
import { parseCurrency, parseReplyMessage } from "@/components/workflow-reply-parser";

export const workflowCostBridgeBoundary = {
  mode: "legacy-readback-compatibility-bridge",
  baseProjectSource: "quote-cost-fixture-only",
  vendorPackageSource: "workflow-vendor-package-legacy-bridge",
  consumerScope: "legacy-local-workflow-cost-readback-only",
  formalQuoteCostRouteStatus: "retired-from-formal-quote-cost-route",
  formalClientConsumer: "none",
  remainingCompatibilityConsumer: "legacy-vendor-financial-relations-helper-via-client-fallback-only",
  formalAppSurfaceConsumer: "none",
  legacyIslandStatus: "design-procurement-via-transitional-formal-rows-plus-vendor-residual-legacy",
  retirementGate: "requires-vendor-residual-replacement-and-local-execution-readback-chain-replacement-before-client-fallback-retirement",
  exitCondition: "design-procurement-segment-now-routes-via-transitional-formal-rows-but-full-retirement-still-requires-replacing-vendor-package-readback-and-vendor-assignment-cost-readback-with-db-or-formal-read-model-sources",
  upstreamInputs: ["execution-section.replyOverrides", "execution-tree.saved-design-procurement-assignments", "vendor-package-bridge-or-assignment-fallback"],
  formalizedSegments: ["design-cost-mapper", "procurement-cost-mapper", "design-procurement-transitional-formal-row-provider"],
  residualLegacySegment: "vendor-package-and-assignment-fallback-only",
  vendorResidualConsumerMode: "package-output-only-no-direct-savedVendorAssignments-read",
} as const;

export function buildFormalDesignCostItems(rows: ProjectFlowFormalReadbackRow[]): CostLineItem[] {
  return rows
    .filter((row) => row.flowType === "design")
    .filter((row) => row.confirmationStatus === "已確認")
    .filter((row) => row.latestConfirmedAmountValue !== null)
    .map((row) => ({
      id: `formal-design-${row.projectId}-${row.taskId}-${row.latestConfirmationId ?? "no-confirmation"}`,
      itemName: row.taskTitle,
      sourceType: "設計",
      sourceRef: `設計文件整理 / ${row.latestConfirmedVendorName ?? "未指定廠商"}`,
      vendorId: null,
      vendorName: row.latestConfirmedVendorName,
      originalAmount: row.latestConfirmedAmountValue ?? 0,
      adjustedAmount: row.latestConfirmedAmountValue ?? 0,
      includedInCost: row.costLocked && row.confirmationStatus === "已確認",
      isManual: false,
    }));
}

export function buildFormalProcurementCostItems(rows: ProjectFlowFormalReadbackRow[]): CostLineItem[] {
  return rows
    .filter((row) => row.flowType === "procurement")
    .filter((row) => row.confirmationStatus === "已確認")
    .filter((row) => row.latestConfirmedAmountValue !== null)
    .map((row) => ({
      id: `formal-procurement-${row.projectId}-${row.taskId}-${row.latestConfirmationId ?? "no-confirmation"}`,
      itemName: row.taskTitle,
      sourceType: "備品",
      sourceRef: `備品整理 / ${row.latestConfirmedVendorName ?? "未指定廠商"}`,
      vendorId: null,
      vendorName: row.latestConfirmedVendorName,
      originalAmount: row.latestConfirmedAmountValue ?? 0,
      adjustedAmount: row.latestConfirmedAmountValue ?? 0,
      includedInCost: row.costLocked && row.confirmationStatus === "已確認",
      isManual: false,
    }));
}

function getMockFormalReadbackRowsForCost(projectId: string): ProjectFlowFormalReadbackRow[] {
  if (typeof window === "undefined") return [];

  const project = quoteCostProjects.find((item) => item.id === projectId);
  if (!project) return [];

  const tree = readStoredExecutionTreeState(projectId);
  const section = readStoredExecutionSectionState(projectId);

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
      projectId,
      taskId: targetId,
      sourceExecutionItemId: targetId,
      projectName: project.projectName,
      taskTitle: assignment.requirement || assignment.assignee ? project.costItems.find((item) => item.id === targetId)?.itemName ?? targetId : targetId,
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
    const generatedCount = section.generatedProcurementDocuments[projectId] ?? 0;
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
      projectId,
      taskId: targetId,
      sourceExecutionItemId: targetId,
      projectName: project.projectName,
      taskTitle: assignment.item || targetId,
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
}

function buildWorkflowCostItems(projectId: string): CostLineItem[] {
  if (typeof window === "undefined") return [];

  const formalRows = getMockFormalReadbackRowsForCost(projectId);
  const designAndProcurementItems = [
    ...buildFormalDesignCostItems(formalRows),
    ...buildFormalProcurementCostItems(formalRows),
  ];

  const vendorPackageBridge = getVendorPackagesForWorkflowProject(projectId);
  const vendorItems: CostLineItem[] = [];

  vendorPackageBridge.packages.forEach((pkg) => {
    pkg.items.forEach((item) => {
      vendorItems.push({
        id: `workflow-vendor-${pkg.id}-${item.assignmentId}`,
        itemName: item.itemName,
        sourceType: "廠商",
        sourceRef: `廠商發包清單 / ${pkg.vendorName}`,
        vendorId: null,
        vendorName: pkg.vendorName || null,
        originalAmount: 0,
        adjustedAmount: 0,
        includedInCost: true,
        isManual: false,
      });
    });
  });

  return [...designAndProcurementItems, ...vendorItems];
}

export function getQuoteCostProjectsForClientFallback(): QuoteCostProject[] {
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
