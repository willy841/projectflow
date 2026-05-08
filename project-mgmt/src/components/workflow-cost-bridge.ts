import type { CostLineItem, QuoteCostProject } from "@/components/quote-cost-data";
import { quoteCostProjects } from "@/components/quote-cost-data";
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
  remainingCompatibilityConsumer: "project-vendor-financial-store-only",
  legacyIslandStatus: "paired-with-project-vendor-financial-store",
  retirementGate: "may-retire-after-vendor-financial-legacy-island-replacement",
} as const;

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
  const vendorPackageBridge = getVendorPackagesForWorkflowProject(projectId);
  vendorPackageBridge.packages.forEach((pkg) => {
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

export function getQuoteCostProjectsWithWorkflow(): QuoteCostProject[] {
  return getQuoteCostProjectsForClientFallback();
}
