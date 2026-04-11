import { getQuoteCostProjectsWithDbFinancialsAndGroups } from '@/lib/db/financial-flow-adapter';
import type { CostLineItem } from '@/components/quote-cost-data';

export type VendorFinancialSummary = {
  unpaidTotal: number;
  records: Array<{
    projectId: string;
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

export async function getVendorFinancialSummary(vendorName: string): Promise<VendorFinancialSummary> {
  const projects = await getQuoteCostProjectsWithDbFinancialsAndGroups();

  const records = projects
    .map((project) => {
      const vendorGroups = project.reconciliationGroups.filter((group) => group.vendorName === vendorName);
      const matchedGroups = vendorGroups.filter((group) => group.reconciliationStatus === '已對帳');
      const hasUnreconciledGroups = vendorGroups.some((group) => group.reconciliationStatus !== '已對帳');
      const costItems = matchedGroups.flatMap((group) => group.items);
      const adjustedCost = matchedGroups.reduce((sum, group) => sum + group.amountTotal, 0);
      const groupStatus = matchedGroups.length > 0 ? '已完成' : project.reconciliationStatus;

      return {
        projectId: project.id,
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
}
