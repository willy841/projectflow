import type { VendorPackage } from "@/components/vendor-data";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import { readStoredExecutionTreeState } from "@/components/workflow-local-storage";

export const workflowVendorPackageBridgeBoundary = {
  mode: "legacy-local-package-bridge",
  primarySource: "local-package-store",
  fallbackSource: "assignment-fallback",
} as const;

export type WorkflowVendorPackageSource = "local-package-store" | "assignment-fallback";

export type WorkflowVendorPackageBridgeResult = {
  source: WorkflowVendorPackageSource;
  packages: VendorPackage[];
};

function buildFallbackPackagesFromAssignments(projectId: string): VendorPackage[] {
  const tree = readStoredExecutionTreeState(projectId);
  const vendorAssignments = Object.entries(tree.savedVendorAssignments)
    .map(([assignmentId, assignment]) => ({ assignmentId, assignment }))
    .filter(({ assignment }) => Boolean(assignment?.vendorName?.trim()));

  if (!vendorAssignments.length) {
    return [];
  }

  const grouped = new Map<string, VendorPackage>();

  vendorAssignments.forEach(({ assignmentId, assignment }) => {
    const vendorName = assignment.vendorName.trim();
    const packageId = `workflow-local-${projectId}-${vendorName}`;
    const existed = grouped.get(packageId);
    if (existed) {
      existed.items.push({
        id: `${packageId}-${assignmentId}`,
        assignmentId,
        itemName: assignment.title || "",
        requirementText: assignment.requirement || "",
      });
      return;
    }

    grouped.set(packageId, {
      id: packageId,
      code: packageId,
      projectId,
      projectName: projectId,
      vendorName,
      eventDate: "",
      location: "",
      loadInTime: "",
      note: "",
      documentStatus: "未生成",
      items: [
        {
          id: `${packageId}-${assignmentId}`,
          assignmentId,
          itemName: assignment.title || "",
          requirementText: assignment.requirement || "",
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
    packages: buildFallbackPackagesFromAssignments(projectId),
  };
}

export function getVendorPackageSummariesForWorkflowProject(projectId: string, vendorName: string): string[] {
  return getVendorPackagesForWorkflowProject(projectId).packages
    .filter((pkg) => pkg.vendorName === vendorName)
    .map((pkg) => `${pkg.code}：${pkg.items.length} 項 / 文件${pkg.documentStatus}`);
}
