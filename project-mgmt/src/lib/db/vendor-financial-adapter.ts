import { getQuoteCostProjectsWithDbFinancialsAndGroups } from '@/lib/db/financial-flow-adapter';
import type { CostLineItem } from '@/components/quote-cost-data';

export type VendorFinancialSummary = {
  unpaidTotal: number;
  records: Array<{
    projectId: string;
    vendorId: string | null;
    projectName: string;
    projectStatus: '執行中' | '已結案';
    reconciliationStatus: string;
    adjustedCost: number;
    adjustedCostLabel: string;
    costItems: CostLineItem[];
    reconciledGroups: Array<{
      sourceType: '設計' | '備品' | '廠商';
      vendorName: string;
      amountTotal: number;
      itemCount: number;
    }>;
    hasUnreconciledGroups: boolean;
  }>;
};

function normalizeVendorName(value: string) {
  return value.trim();
}

export async function getVendorFinancialSummary({ vendorId, vendorName }: { vendorId?: string; vendorName: string }): Promise<VendorFinancialSummary> {
  try {
    const projects = await getQuoteCostProjectsWithDbFinancialsAndGroups();
    const normalizedVendorName = normalizeVendorName(vendorName);

    const records = projects
    .map((project) => {
      const vendorGroups = project.reconciliationGroups.filter((group) => normalizeVendorName(group.vendorName) === normalizedVendorName);
      const matchedGroups = vendorGroups.filter((group) => group.reconciliationStatus === '已對帳');
      const hasUnreconciledGroups = vendorGroups.some((group) => group.reconciliationStatus !== '已對帳');
      const costItems = matchedGroups.flatMap((group) => group.items);
      const adjustedCost = matchedGroups.reduce((sum, group) => sum + group.amountTotal, 0);
      const groupStatus = matchedGroups.length > 0 ? '已完成' : project.reconciliationStatus;

      return {
        projectId: project.id,
        vendorId: vendorId ?? null,
        projectName: project.projectName,
        projectStatus: project.projectStatus,
        reconciliationStatus: groupStatus,
        adjustedCost,
        adjustedCostLabel: `NT$ ${adjustedCost.toLocaleString('zh-TW')}`,
        costItems,
        reconciledGroups: matchedGroups.map((group) => ({
          sourceType: group.sourceType,
          vendorName: group.vendorName,
          amountTotal: group.amountTotal,
          itemCount: group.itemCount,
        })),
        hasUnreconciledGroups,
      };
    })
    .filter((record) => record.reconciledGroups.length > 0);

    return {
      unpaidTotal: records.reduce((sum, record) => sum + record.adjustedCost, 0),
      records,
    };
  } catch {
    return {
      unpaidTotal: 0,
      records: [],
    };
  }
}
