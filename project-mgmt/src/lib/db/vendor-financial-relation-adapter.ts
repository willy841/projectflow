import { formatCurrency, type CostLineItem, type QuoteCostProject } from '@/components/quote-cost-data';
import type { VendorPaymentStatus } from '@/components/vendor-data';
import { createPhase1DbClient } from '@/lib/db/phase1-client';
import { listDbVendorPackages } from '@/lib/db/vendor-package-adapter';
import { getQuoteCostProjectsWithDbFinancialsAndGroups } from '@/lib/db/financial-flow-adapter';

export type DbVendorFinancialRelation = {
  relationKey: string;
  projectId: string;
  vendorId: string;
  projectName: string;
  vendorName: string;
  projectStatus: QuoteCostProject['projectStatus'];
  adjustedCostTotal: number;
  rawCostTotal: number;
  paymentStatus: VendorPaymentStatus;
  unpaidAmount: number;
  costItemCount: number;
  costItemsSummary: string[];
  packageCount: number;
  packageSummary: string[];
};

export const vendorFinancialRelationDbBoundary = {
  mode: 'db-read-model',
  source: 'quote-cost-projects-with-db-financials-and-groups',
} as const;

function getRelationKey(projectId: string, vendorId: string) {
  return `${projectId}::${vendorId}`;
}

function summarizeCostItems(items: CostLineItem[]) {
  return items
    .map((item) => `${item.itemName}（${formatCurrency(item.adjustedAmount)}）`)
    .slice(0, 6);
}

function summarizePackages(
  projectId: string,
  vendorName: string,
  packages: Awaited<ReturnType<typeof listDbVendorPackages>>,
) {
  return packages
    .filter((pkg) => pkg.projectId === projectId && pkg.vendorName === vendorName)
    .map((pkg) => `${pkg.code}：${pkg.items.length} 項 / 文件${pkg.documentStatus}`);
}

async function loadPaidAmountByProjectVendor() {
  const db = createPhase1DbClient();
  const rows = await db.query<{
    projectId: string;
    vendorId: string | null;
    vendorName: string;
    totalPaid: number;
  }>(`
    select
      project_id as "projectId",
      vendor_id as "vendorId",
      vendor_name as "vendorName",
      coalesce(sum(amount), 0)::float8 as "totalPaid"
    from project_vendor_payment_records
    group by project_id, vendor_id, vendor_name
  `).catch(() => ({ rows: [] }));

  const byRelationKey = new Map<string, number>();
  rows.rows.forEach((row) => {
    const vendorId = row.vendorId?.trim() || `vendor-name:${row.vendorName.trim()}`;
    byRelationKey.set(getRelationKey(row.projectId, vendorId), Number(row.totalPaid ?? 0));
  });
  return byRelationKey;
}

export async function listDbVendorFinancialRelations(): Promise<DbVendorFinancialRelation[]> {
  const [projects, packages, paidAmountByRelationKey] = await Promise.all([
    getQuoteCostProjectsWithDbFinancialsAndGroups(),
    listDbVendorPackages(),
    loadPaidAmountByProjectVendor(),
  ]);

  const relations = new Map<string, DbVendorFinancialRelation>();

  projects.forEach((project) => {
    const groups = new Map<string, { vendorId: string; vendorName: string; items: CostLineItem[] }>();

    project.costItems
      .filter((item) => !item.isManual)
      .filter((item): item is CostLineItem & { vendorName: string } => Boolean(item.vendorName))
      .forEach((item) => {
        const vendorName = item.vendorName.trim();
        const vendorId = item.vendorId?.trim() || `vendor-name:${vendorName}`;
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
      const packageSummary = summarizePackages(project.id, vendorName, packages);
      const paidAmount = paidAmountByRelationKey.get(relationKey) ?? 0;
      const unpaidAmount = Math.max(adjustedCostTotal - paidAmount, 0);
      const paymentStatus: VendorPaymentStatus = unpaidAmount === 0 && adjustedCostTotal > 0 ? '已付款' : '未付款';

      relations.set(relationKey, {
        relationKey,
        projectId: project.id,
        vendorId,
        projectName: project.projectName,
        vendorName,
        projectStatus: project.projectStatus,
        adjustedCostTotal,
        rawCostTotal,
        paymentStatus,
        unpaidAmount,
        costItemCount: items.length,
        costItemsSummary: summarizeCostItems(items),
        packageCount: packageSummary.length,
        packageSummary,
      });
    });
  });

  return Array.from(relations.values());
}
