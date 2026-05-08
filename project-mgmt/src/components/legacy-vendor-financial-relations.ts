import {
  formatCurrency,
  type CostLineItem,
  type QuoteCostProject,
} from "@/components/quote-cost-data";
import { vendorPackages, vendorProfiles } from "@/components/vendor-data";
import type { ProjectVendorFinancialRelation } from "@/components/vendor-financial-relation-types";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import { getLegacyVendorFinancialProjects } from "@/components/workflow-cost-bridge";
import {
  applyStoredProjectVendorFinancialOverrides,
  buildProjectVendorFinancialFallbackRelations,
} from "@/components/workflow-vendor-financial-fallback";

function cloneRelation(relation: ProjectVendorFinancialRelation): ProjectVendorFinancialRelation {
  return {
    ...relation,
    costItemsSummary: [...relation.costItemsSummary],
    packageSummary: [...relation.packageSummary],
  };
}

function getRelationKey(projectId: string, vendorId: string) {
  return `${projectId}::${vendorId}`;
}

function resolveVendorId(input: { vendorId?: string | null; vendorName?: string | null }) {
  const normalizedName = input.vendorName?.trim();
  if (normalizedName) {
    const matchedProfile = vendorProfiles.find((vendor) => vendor.name === normalizedName);
    if (matchedProfile) return matchedProfile.id;
  }
  if (input.vendorId?.trim()) return input.vendorId;
  if (normalizedName) return `vendor-name:${normalizedName}`;
  return "vendor-name:未指定廠商";
}

function summarizeCostItems(items: CostLineItem[]) {
  return items
    .map((item) => `${item.itemName}（${formatCurrency(item.adjustedAmount)}）`)
    .slice(0, 6);
}

function summarizePackages(projectId: string, vendorName: string) {
  const storedPackages = typeof window === "undefined" ? vendorPackages.filter((pkg) => pkg.projectId === projectId) : getStoredPackagesByProjectId(projectId);
  return storedPackages
    .filter((pkg) => pkg.vendorName === vendorName)
    .map((pkg) => `${pkg.code}：${pkg.items.length} 項 / 文件${pkg.documentStatus}`);
}

function buildQuoteCostRelations(projects: QuoteCostProject[]) {
  const relations = new Map<string, ProjectVendorFinancialRelation>();

  projects.forEach((project) => {
    const groups = new Map<string, { vendorId: string; vendorName: string; items: CostLineItem[] }>();

    project.costItems
      .filter((item) => !item.isManual)
      .filter((item) => item.vendorId || item.vendorName)
      .forEach((item) => {
        const vendorId = resolveVendorId({ vendorId: item.vendorId, vendorName: item.vendorName });
        const vendorName = item.vendorName?.trim() || item.vendorId || "未指定廠商";
        const key = getRelationKey(project.id, vendorId);
        if (!groups.has(key)) {
          groups.set(key, {
            vendorId,
            vendorName,
            items: [],
          });
        }
        groups.get(key)?.items.push(item);
      });

    groups.forEach(({ vendorId, vendorName, items }) => {
      const relationKey = getRelationKey(project.id, vendorId);
      const adjustedCostTotal = items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.adjustedAmount, 0);
      const rawCostTotal = items.filter((item) => item.includedInCost).reduce((sum, item) => sum + item.originalAmount, 0);
      const packageSummary = summarizePackages(project.id, vendorName);

      relations.set(relationKey, {
        relationKey,
        projectId: project.id,
        vendorId,
        projectName: project.projectName,
        vendorName,
        projectStatus: project.projectStatus,
        adjustedCostTotal,
        rawCostTotal,
        paymentStatus: "未付款",
        unpaidAmount: adjustedCostTotal,
        costItemCount: items.length,
        costItemsSummary: summarizeCostItems(items),
        packageCount: packageSummary.length,
        packageSummary,
      });
    });
  });

  return relations;
}

export function assembleLegacyVendorFinancialRelations() {
  const merged = buildQuoteCostRelations(getLegacyVendorFinancialProjects());
  applyStoredProjectVendorFinancialOverrides(merged);

  if (!merged.size) {
    buildProjectVendorFinancialFallbackRelations().forEach((relation) => {
      merged.set(relation.relationKey, relation);
    });
  }

  return Array.from(merged.values()).map(cloneRelation);
}
