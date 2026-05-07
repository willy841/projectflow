import type { VendorPaymentStatus, VendorProjectRecord } from "@/components/vendor-data";
import { vendorProjectRecords } from "@/components/vendor-data";
import type { ProjectVendorFinancialRelation } from "@/components/project-vendor-financial-store";

const STORAGE_KEY = "projectflow-project-vendor-financial-relations";

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

export function readStoredProjectVendorFinancialOverrides() {
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

export function writeStoredProjectVendorFinancialPaymentStatus(
  relations: ProjectVendorFinancialRelation[],
  projectId: string,
  vendorId: string,
  paymentStatus: VendorPaymentStatus,
) {
  if (typeof window === "undefined") return relations;

  const target = relations.find((relation) => relation.projectId === projectId && relation.vendorId === vendorId);
  if (!target) return relations;

  const overrideMap = new Map(readStoredProjectVendorFinancialOverrides().map((relation) => [relation.relationKey, cloneRelation(relation)]));
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
  return nextOverrides;
}

function mapFallbackRecordToRelation(record: VendorProjectRecord): ProjectVendorFinancialRelation {
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
  } satisfies ProjectVendorFinancialRelation;
}

export function buildProjectVendorFinancialFallbackRelations() {
  return vendorProjectRecords.map(mapFallbackRecordToRelation);
}
