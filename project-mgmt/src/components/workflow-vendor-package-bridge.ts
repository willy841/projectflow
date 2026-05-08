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
  assignmentFallbackStatus: "still-derived-from-vendor-assignment-draft-shape-not-formal-package-source",
  replacementOrder: ["assignment-fallback-replacement", "local-package-store-readback-replacement", "vendor-cost-readback-replacement"],
  exitCondition: "requires-replacing-both-local-package-store-readback-and-savedVendorAssignments-assignment-fallback-before-bridge-retirement",
  transitionalFormalProviderStatus: "provider-shape-extracted-db-source-not-wired-in-client-bridge-yet",
} as const;

export type WorkflowVendorPackageSource = "local-package-store" | "assignment-fallback";

export type WorkflowVendorPackageBridgeResult = {
  source: WorkflowVendorPackageSource;
  packages: VendorPackage[];
};

export type VendorPackageFormalFallbackRow = {
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

function getMockVendorPackageFormalRows(projectId: string): VendorPackageFormalFallbackRow[] {
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

function buildFallbackPackagesFromFormalRows(projectId: string, rows: VendorPackageFormalFallbackRow[]): VendorPackage[] {
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
        },
      ],
    });
  });

  return Array.from(grouped.values());
}

export function getVendorPackagesForWorkflowProject(projectId: string): WorkflowVendorPackageBridgeResult {
  const storedPackages = getStoredPackagesByProjectId(projectId);
  if (storedPackages.length) {
    return {
      source: "local-package-store",
      packages: storedPackages,
    };
  }

  return {
    source: "assignment-fallback",
    packages: buildFallbackPackagesFromFormalRows(projectId, getMockVendorPackageFormalRows(projectId)),
  };
}

export function getVendorPackageSummariesForWorkflowProject(projectId: string): string[] {
  return getVendorPackagesForWorkflowProject(projectId).packages.map(
    (pkg) => `${pkg.code}：${pkg.items.length} 項 / 文件${pkg.documentStatus}`,
  );
}
