import {
  formatCurrency,
  type CostLineItem,
  type QuoteCostProject,
} from "@/components/quote-cost-data";
import {
  vendorPackages,
  vendorProjectRecords,
  vendorProfiles,
  type VendorPaymentStatus,
  type VendorProjectRecord,
} from "@/components/vendor-data";
import { getStoredPackagesByProjectId } from "@/components/vendor-package-store";
import { getQuoteCostProjectsWithWorkflow } from "@/components/project-workflow-store";

const STORAGE_KEY = "projectflow-project-vendor-financial-relations";

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

function buildFallbackRelationFromRecord(record: VendorProjectRecord): ProjectVendorFinancialRelation {
  const relationKey = getRelationKey(record.projectId, record.vendorId);
  return {
    relationKey,
    projectId: record.projectId,
    vendorId: record.vendorId,
    projectName: record.projectName,
    vendorName: record.vendorName,
    projectStatus: record.projectStatus,
    adjustedCostTotal: record.adjustedCost,
    rawCostTotal: record.adjustedCost,
    paymentStatus: record.paymentStatus,
    unpaidAmount: record.paymentStatus === "未付款" ? record.adjustedCost : 0,
    costItemCount: record.costBreakdown.length,
    costItemsSummary: record.costBreakdown.map((item) => `${item.label}（${item.amount}）`),
    packageCount: record.packageId ? 1 : 0,
    packageSummary: record.packageId ? [record.packageId] : [],
  };
}

function readStoredOverrides() {
  if (typeof window === "undefined") return [] as ProjectVendorFinancialRelation[];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ProjectVendorFinancialRelation[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function getProjectVendorFinancialRelations() {
  const quoteCostRelations = buildQuoteCostRelations(getQuoteCostProjectsWithWorkflow());
  const storedOverrides = readStoredOverrides();
  const merged = new Map<string, ProjectVendorFinancialRelation>();

  quoteCostRelations.forEach((relation, key) => {
    merged.set(key, relation);
  });

  storedOverrides.forEach((relation) => {
    const baseRelation = merged.get(relation.relationKey);
    if (!baseRelation) return;

    const nextAdjustedCostTotal = baseRelation.adjustedCostTotal;
    const nextPaymentStatus = relation.paymentStatus;
    merged.set(relation.relationKey, {
      ...baseRelation,
      paymentStatus: nextPaymentStatus,
      unpaidAmount: nextPaymentStatus === "已付款" ? 0 : nextAdjustedCostTotal,
    });
  });

  vendorProjectRecords.forEach((record) => {
    const relation = buildFallbackRelationFromRecord(record);
    if (!merged.has(relation.relationKey)) {
      merged.set(relation.relationKey, relation);
    }
  });

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
  const target = current.find((relation) => relation.projectId === projectId && relation.vendorId === vendorId);
  if (!target) return current;

  const overrideMap = new Map(readStoredOverrides().map((relation) => [relation.relationKey, cloneRelation(relation)]));
  overrideMap.set(target.relationKey, {
    ...target,
    paymentStatus,
    unpaidAmount: paymentStatus === "已付款" ? 0 : target.adjustedCostTotal,
  });

  const nextOverrides = Array.from(overrideMap.values()).map((relation) => ({
    ...relation,
    unpaidAmount: relation.paymentStatus === "已付款" ? 0 : relation.adjustedCostTotal,
  }));

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextOverrides));
  return getProjectVendorFinancialRelations();
}

export function getVendorOutstandingTotal(vendorId: string, vendorName?: string) {
  const relations = getRelationsByVendor({ vendorId, vendorName });
  if (relations.length) {
    return relations
      .filter((relation) => relation.paymentStatus === "未付款")
      .reduce((sum, relation) => sum + relation.unpaidAmount, 0);
  }

  return vendorProjectRecords
    .filter((record) => record.vendorId === vendorId || (vendorName ? record.vendorName === vendorName : false))
    .filter((record) => record.paymentStatus === "未付款")
    .reduce((sum, record) => sum + record.adjustedCost, 0);
}
