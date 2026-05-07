import { formatCurrency, type CostLineItem, type QuoteCostProject } from '@/components/quote-cost-data';
import type { VendorPaymentStatus } from '@/components/vendor-data';
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

export async function listDbVendorFinancialRelations(): Promise<DbVendorFinancialRelation[]> {
  const [projects, packages] = await Promise.all([
    getQuoteCostProjectsWithDbFinancialsAndGroups(),
    listDbVendorPackages(),
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

      relations.set(relationKey, {
        relationKey,
        projectId: project.id,
        vendorId,
        projectName: project.projectName,
        vendorName,
        projectStatus: project.projectStatus,
        adjustedCostTotal,
        rawCostTotal,
        paymentStatus: '未付款',
        unpaidAmount: adjustedCostTotal,
        costItemCount: items.length,
        costItemsSummary: summarizeCostItems(items),
        packageCount: packageSummary.length,
        packageSummary,
      });
    });
  });

  return Array.from(relations.values());
}
