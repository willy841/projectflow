import type { VendorPaymentStatus, VendorProjectRecord } from "@/components/vendor-data";
import { vendorProjectRecords } from "@/components/vendor-data";
import type { ProjectVendorFinancialRelation } from "@/components/project-vendor-financial-store";

const STORAGE_KEY = "projectflow-project-vendor-financial-relations";

type StoredProjectVendorFinancialOverride = {
  relationKey: string;
  paymentStatus: VendorPaymentStatus;
};

function getRelationKey(projectId: string, vendorId: string) {
  return `${projectId}::${vendorId}`;
}

function readStoredProjectVendorFinancialOverrides() {
  if (typeof window === "undefined") return [] as StoredProjectVendorFinancialOverride[];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredProjectVendorFinancialOverride[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.relationKey === "string" && (item.paymentStatus === "未付款" || item.paymentStatus === "已付款"));
  } catch {
    return [];
  }
}

export function applyStoredProjectVendorFinancialOverrides(relations: Map<string, ProjectVendorFinancialRelation>) {
  const storedOverrides = readStoredProjectVendorFinancialOverrides();

  storedOverrides.forEach((override) => {
    const baseRelation = relations.get(override.relationKey);
    if (!baseRelation) return;

    const nextAdjustedCostTotal = baseRelation.adjustedCostTotal;
    const nextPaymentStatus = override.paymentStatus;
    relations.set(override.relationKey, {
      ...baseRelation,
      paymentStatus: nextPaymentStatus,
      unpaidAmount: nextPaymentStatus === "已付款" ? 0 : nextAdjustedCostTotal,
    });
  });

  return relations;
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

  const overrideMap = new Map(readStoredProjectVendorFinancialOverrides().map((relation) => [relation.relationKey, relation]));
  overrideMap.set(target.relationKey, {
    relationKey: target.relationKey,
    paymentStatus,
  });

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(overrideMap.values())));
  return relations;
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
