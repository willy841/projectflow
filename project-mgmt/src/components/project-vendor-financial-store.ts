import {
  formatCurrency,
  type CostLineItem,
  type QuoteCostProject,
} from "@/components/quote-cost-data";
import {
  vendorPackages,
  vendorProfiles,
  type VendorPaymentStatus,
} from "@/components/vendor-data";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import { getQuoteCostProjectsWithWorkflow } from "@/components/workflow-cost-bridge";
import {
  applyStoredProjectVendorFinancialOverrides,
  buildProjectVendorFinancialFallbackRelations,
  writeStoredProjectVendorFinancialPaymentStatus,
} from "@/components/workflow-vendor-financial-fallback";

export const projectVendorFinancialStoreBoundary = {
  mode: "legacy-vendor-financial-island",
  primaryProjectSource: "workflow-fallback-bridge",
  sourceStatus: "legacy-compatibility-only-not-formal-source-of-truth",
  formalRouteConsumer: "none",
  formalVendorPagesStatus: "db-routes-detached",
  legacyUiConsumer: "none-detected",
  islandStatus: "orphaned-legacy-island",
  pairedLegacyDependency: "workflow-cost-bridge-only",
  retirementGate: "may-retire-after-formal-vendor-financial-island-replacement-or-direct-island-removal",
  dbReplacementRequires: "server-or-async-read-model",
} as const;

export type ProjectVendorFinancialRelation = {
  relationKey: string;
  projectId: string;
  vendorId: string;
  projectName: string;
  vendorName: string;
  projectStatus: QuoteCostProject["projectStatus"];
  adjustedCostTotal: number;
  rawCostTotal: number;
  paymentStatus: VendorPaymentStatus;
  unpaidAmount: number;
  costItemCount: number;
  costItemsSummary: string[];
  packageCount: number;
  packageSummary: string[];
};

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

export function getProjectVendorFinancialRelations() {
  const merged = buildQuoteCostRelations(getQuoteCostProjectsWithWorkflow());
  applyStoredProjectVendorFinancialOverrides(merged);

  if (!merged.size) {
    buildProjectVendorFinancialFallbackRelations().forEach((relation) => {
      merged.set(relation.relationKey, relation);
    });
  }

  return Array.from(merged.values()).map(cloneRelation);
}

export function getRelationsByProjectId(projectId: string) {
  return getProjectVendorFinancialRelations().filter((relation) => relation.projectId === projectId);
}

export function getRelationsByVendor(params: { vendorId?: string; vendorName?: string }) {
  return getProjectVendorFinancialRelations().filter((relation) => {
    if (params.vendorId && relation.vendorId === params.vendorId) return true;
    if (params.vendorName && relation.vendorName === params.vendorName) return true;
    return false;
  });
}

export function getRelationByProjectVendor(projectId: string, vendorId: string) {
  return getProjectVendorFinancialRelations().find((relation) => relation.projectId === projectId && relation.vendorId === vendorId) ?? null;
}

export function writeProjectVendorFinancialPaymentStatus(projectId: string, vendorId: string, paymentStatus: VendorPaymentStatus) {
  if (typeof window === "undefined") return getProjectVendorFinancialRelations();

  const current = getProjectVendorFinancialRelations();
  writeStoredProjectVendorFinancialPaymentStatus(current, projectId, vendorId, paymentStatus);
  return getProjectVendorFinancialRelations();
}

export function getVendorOutstandingTotal(vendorId: string, vendorName?: string) {
  const relations = getRelationsByVendor({ vendorId, vendorName });
  if (relations.length) {
    return relations
      .filter((relation) => relation.paymentStatus === "未付款")
      .reduce((sum, relation) => sum + relation.unpaidAmount, 0);
  }

  return buildProjectVendorFinancialFallbackRelations()
    .filter((relation) => relation.vendorId === vendorId || (vendorName ? relation.vendorName === vendorName : false))
    .filter((relation) => relation.paymentStatus === "未付款")
    .reduce((sum, relation) => sum + relation.adjustedCostTotal, 0);
}
