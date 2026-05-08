import { type VendorPaymentStatus } from "@/components/vendor-data";
import { assembleLegacyVendorFinancialRelations } from "@/components/legacy-vendor-financial-relations";
import type { ProjectVendorFinancialRelation } from "@/components/vendor-financial-relation-types";
import { writeStoredProjectVendorFinancialPaymentStatus } from "@/components/workflow-vendor-financial-fallback";

export const projectVendorFinancialStoreBoundary = {
  mode: "legacy-vendor-financial-island",
  primaryProjectSource: "legacy-vendor-financial-projects-bridge",
  sourceStatus: "legacy-compatibility-only-not-formal-source-of-truth",
  formalRouteConsumer: "none",
  formalVendorPagesStatus: "db-routes-detached",
  legacyUiConsumer: "none-detected",
  islandStatus: "orphaned-legacy-island",
  pairedLegacyDependency: "legacy-vendor-financial-relations-helper-only",
  retirementGate: "may-retire-after-formal-vendor-financial-island-replacement-or-direct-island-removal",
  dbReplacementRequires: "server-or-async-read-model",
} as const;

export function getProjectVendorFinancialRelations() {
  return assembleLegacyVendorFinancialRelations();
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

  return 0;
}
