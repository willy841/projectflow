import type { CostLineItem, QuoteCostProject } from "@/components/quote-cost-data";
import { quoteCostProjects } from "@/components/quote-cost-data";
import type { ProjectFlowFormalReadbackRow } from "@/components/workflow-derived-board";
import type { DbVendorPackageShape, WorkflowVendorPackageBridgeResult } from "@/components/workflow-vendor-package-bridge";
import { getVendorPackagesForWorkflowProject } from "@/components/workflow-vendor-package-bridge";

export const workflowCostBridgeBoundary = {
  mode: "legacy-readback-compatibility-bridge",
  baseProjectSource: "quote-cost-fixture-only",
  vendorPackageSource: "workflow-vendor-package-legacy-bridge",
  consumerScope: "legacy-local-workflow-cost-readback-only",
  formalQuoteCostRouteStatus: "retired-from-formal-quote-cost-route",
  formalClientConsumer: "none",
  remainingCompatibilityConsumer: "legacy-vendor-financial-relations-helper-via-client-fallback-only",
  formalAppSurfaceConsumer: "none",
  legacyIslandStatus: "design-procurement-preload-ready-plus-vendor-residual-legacy",
  retirementGate: "requires-vendor-residual-replacement-and-local-execution-readback-chain-replacement-before-client-fallback-retirement",
  exitCondition: "design-procurement-segment-now-routes-via-transitional-formal-rows-but-full-retirement-still-requires-replacing-vendor-package-readback-and-vendor-assignment-cost-readback-with-db-or-formal-read-model-sources",
  upstreamInputs: ["preloaded-formal-rows", "vendor-package-bridge-or-assignment-fallback"],
  formalizedSegments: ["design-cost-mapper", "procurement-cost-mapper", "design-procurement-preloaded-formal-row-provider"],
  residualLegacySegment: "vendor-package-and-assignment-fallback-only",
  vendorResidualConsumerMode: "package-output-only-no-direct-savedVendorAssignments-read",
  preloadReadyVendorPackageInput: true,
  vendorPackagePreloadStatus: "input-ready-not-yet-supplied-by-runtime",
  vendorPackageAdoptionGate: "requires-server-side-or-loader-mediated-db-package-preload-before-db-package-source-branch-becomes-live",
  vendorAmountFormalizationStatus: "blocked-by-package-shape-without-item-level-amount",
} as const;

export type WorkflowCostBridgeInput = {
  projectId: string;
  preloadedDbPackages?: DbVendorPackageShape[] | null;
  preloadedFormalRows?: ProjectFlowFormalReadbackRow[] | null;
};

export type WorkflowCostPreloadedSources = {
  projectId: string;
  vendorPackages?: DbVendorPackageShape[] | null;
  formalRows?: ProjectFlowFormalReadbackRow[] | null;
};

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

function getVendorPackageBridgeResult(input: WorkflowCostBridgeInput): WorkflowVendorPackageBridgeResult {
  return getVendorPackagesForWorkflowProject({
    projectId: input.projectId,
    preloadedDbPackages: input.preloadedDbPackages,
  });
}

export function buildWorkflowCostItemsFromPreloadedSources(input: WorkflowCostPreloadedSources): CostLineItem[] {
  const designAndProcurementItems = [
    ...buildFormalDesignCostItems(input.formalRows ?? []),
    ...buildFormalProcurementCostItems(input.formalRows ?? []),
  ];

  const vendorItems: CostLineItem[] = [];
  (input.vendorPackages ?? []).forEach((pkg) => {
    pkg.items.forEach((item) => {
      vendorItems.push({
        id: `workflow-vendor-${pkg.id}-${item.assignmentId}`,
        itemName: item.itemName,
        sourceType: "廠商",
        sourceRef: `廠商發包清單 / ${pkg.vendorName}`,
        vendorId: null,
        vendorName: pkg.vendorName || null,
        originalAmount: item.amountValue ?? 0,
        adjustedAmount: item.amountValue ?? 0,
        includedInCost: true,
        isManual: false,
      });
    });
  });

  return [...designAndProcurementItems, ...vendorItems];
}

function buildWorkflowCostItems(input: WorkflowCostBridgeInput): CostLineItem[] {
  if (typeof window === "undefined") return [];
  if (!input.preloadedFormalRows?.length && !input.preloadedDbPackages?.length) return [];

  const vendorPackageBridge = getVendorPackageBridgeResult(input);

  return buildWorkflowCostItemsFromPreloadedSources({
    projectId: input.projectId,
    formalRows: input.preloadedFormalRows ?? [],
    vendorPackages: vendorPackageBridge.packages,
  });
}

export function getQuoteCostProjectsForClientFallback(preloadedDbPackages?: DbVendorPackageShape[] | null, preloadedFormalRows?: ProjectFlowFormalReadbackRow[] | null): QuoteCostProject[] {
  if (typeof window === "undefined") return quoteCostProjects;

  return quoteCostProjects.map((project) => {
    const workflowItems = buildWorkflowCostItems({
      projectId: project.id,
      preloadedDbPackages,
      preloadedFormalRows: preloadedFormalRows?.filter((row) => row.projectId === project.id) ?? null,
    });
    if (!workflowItems.length) return project;

    const workflowSourceTypes = new Set(workflowItems.map((item) => item.sourceType));
    const preservedSeedItems = project.costItems.filter((item) => item.isManual || !workflowSourceTypes.has(item.sourceType));

    return {
      ...project,
      costItems: [...preservedSeedItems, ...workflowItems],
    };
  });
}

export function getQuoteCostProjectCostItemsFromPreloadedSources(input: {
  projectId: string;
  seedCostItems: CostLineItem[];
  preloadedDbPackages?: DbVendorPackageShape[] | null;
  preloadedFormalRows?: ProjectFlowFormalReadbackRow[] | null;
}): CostLineItem[] {
  const workflowItems = buildWorkflowCostItems({
    projectId: input.projectId,
    preloadedDbPackages: input.preloadedDbPackages,
    preloadedFormalRows: input.preloadedFormalRows?.filter((row) => row.projectId === input.projectId) ?? null,
  });

  if (!workflowItems.length) {
    return input.seedCostItems;
  }

  const workflowSourceTypes = new Set(workflowItems.map((item) => item.sourceType));
  const preservedSeedItems = input.seedCostItems.filter((item) => item.isManual || !workflowSourceTypes.has(item.sourceType));

  return [...preservedSeedItems, ...workflowItems];
}
