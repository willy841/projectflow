import type { VendorPackage } from "@/components/vendor-data";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import { readStoredExecutionTreeState } from "@/components/workflow-local-storage";

export const workflowVendorPackageBridgeBoundary = {
  mode: "legacy-local-package-bridge",
  primarySource: "local-package-store",
  fallbackSource: "assignment-fallback",
  consumerScope: "workflow-cost-local-readback-only",
  formalVendorAssignmentsRouteStatus: "not-used-by-formal-vendor-assignments-route",
  remainingConsumer: "workflow-cost-bridge-vendor-residual-only",
  dependencyInputs: ["vendor-package-store", "execution-tree.savedVendorAssignments"],
  assignmentFallbackInputs: ["vendorName", "title", "requirement"],
  assignmentFallbackStatus: "draft-derived-package-like-fallback-not-formal-package-source",
  replacementOrder: ["draft-fallback-row-provider-replacement", "local-package-store-readback-replacement", "vendor-cost-readback-replacement"],
  exitCondition: "requires-replacing-both-local-package-store-readback-and-savedVendorAssignments-assignment-fallback-before-bridge-retirement",
  transitionalFormalProviderStatus: "legacy-local-and-assignment-fallback-only-db-source-handled-upstream-via-preload",
  sourceProviderMode: "local-package-or-assignment-fallback-only",
  dbProviderInterfaceStatus: "removed-from-bridge-runtime-surface",
  dbProviderShapeStatus: "db-package-shape-consumed-upstream-before-bridge",
  currentRuntimeShape: "local-provider-first-assignment-fallback-second",
  asyncAdoptionGate: "db-package-source-must-enter-through-upstream-preload-consumers-not-this-bridge",
} as const;

export type WorkflowVendorPackageSource = "local-package-store" | "assignment-fallback" | "db-package-source";

export type WorkflowVendorPackageBridgeResult = {
  source: WorkflowVendorPackageSource;
  packages: VendorPackage[];
};

export type WorkflowVendorPackageBridgeInput = {
  projectId: string;
  preloadedDbPackages?: DbVendorPackageShape[] | null;
};

export type VendorPackageDraftFallbackRow = {
  projectId: string;
  vendorTaskId: string;
  sourceExecutionItemId: string | null;
  vendorId: string | null;
  vendorName: string;
  itemTitle: string;
  requirementText: string;
  packageId: string | null;
  packageCode: string | null;
};

export type DbVendorPackageShape = VendorPackage;

function getDraftFallbackRowsFromVendorAssignments(projectId: string): VendorPackageDraftFallbackRow[] {
  const tree = readStoredExecutionTreeState(projectId);
  return Object.entries(tree.savedVendorAssignments)
    .map(([assignmentId, assignment]) => ({ assignmentId, assignment }))
    .filter(({ assignment }) => Boolean(assignment?.vendorName?.trim()))
    .map(({ assignmentId, assignment }) => ({
      projectId,
      vendorTaskId: assignmentId,
      sourceExecutionItemId: assignmentId,
      vendorId: null,
      vendorName: assignment.vendorName.trim(),
      itemTitle: assignment.title || "",
      requirementText: assignment.requirement || "",
      packageId: null,
      packageCode: null,
    }));
}

function buildFallbackPackagesFromDraftRows(projectId: string, rows: VendorPackageDraftFallbackRow[]): VendorPackage[] {
  if (!rows.length) {
    return [];
  }

  const grouped = new Map<string, VendorPackage>();

  rows.forEach((row) => {
    const packageId = row.packageId ?? `workflow-local-${projectId}-${row.vendorName}`;
    const existed = grouped.get(packageId);
    if (existed) {
      existed.items.push({
        id: `${packageId}-${row.vendorTaskId}`,
        assignmentId: row.vendorTaskId,
        itemName: row.itemTitle,
        requirementText: row.requirementText,
        amountLabel: null,
        amountValue: null,
      });
      return;
    }

    grouped.set(packageId, {
      id: packageId,
      code: row.packageCode ?? packageId,
      projectId,
      projectName: projectId,
      vendorName: row.vendorName,
      eventDate: "",
      location: "",
      loadInTime: "",
      note: "",
      documentStatus: "未生成",
      items: [
        {
          id: `${packageId}-${row.vendorTaskId}`,
          assignmentId: row.vendorTaskId,
          itemName: row.itemTitle,
          requirementText: row.requirementText,
          amountLabel: null,
          amountValue: null,
        },
      ],
    });
  });

  return Array.from(grouped.values());
}

function getDraftFallbackPackagesForWorkflowProject(projectId: string): VendorPackage[] {
  return buildFallbackPackagesFromDraftRows(projectId, getDraftFallbackRowsFromVendorAssignments(projectId));
}

function getLocalVendorPackagesForWorkflowProject(projectId: string): VendorPackage[] {
  return getStoredPackagesByProjectId(projectId);
}

export function getVendorPackagesForWorkflowProject(input: string | WorkflowVendorPackageBridgeInput): WorkflowVendorPackageBridgeResult {
  const resolved = typeof input === "string" ? { projectId: input } : input;

  if (resolved.preloadedDbPackages?.length) {
    return {
      source: "db-package-source",
      packages: resolved.preloadedDbPackages.filter((pkg) => pkg.projectId === resolved.projectId),
    };
  }

  const localPackages = getLocalVendorPackagesForWorkflowProject(resolved.projectId);
  if (localPackages.length) {
    return {
      source: "local-package-store",
      packages: localPackages,
    };
  }

  return {
    source: "assignment-fallback",
    packages: getDraftFallbackPackagesForWorkflowProject(resolved.projectId),
  };
}

export function getVendorPackageSummariesForWorkflowProject(projectId: string): string[] {
  return getVendorPackagesForWorkflowProject(projectId).packages.map(
    (pkg) => `${pkg.code}：${pkg.items.length} 項 / 文件${pkg.documentStatus}`,
  );
}
