import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import type { CostLineItem, CostSourceType, QuoteCostProject } from '@/components/quote-cost-data';

export type FinancialReconciliationGroup = {
  key: string;
  projectId: string;
  projectName: string;
  sourceType: Exclude<CostSourceType, '人工'>;
  vendorName: string;
  amountTotal: number;
  itemCount: number;
  items: CostLineItem[];
  reconciliationStatus: '未對帳' | '待確認' | '已對帳';
};

export type FinancialProjectWithGroups = QuoteCostProject & {
  reconciliationGroups: FinancialReconciliationGroup[];
};

function buildGroupKey(projectId: string, sourceType: Exclude<CostSourceType, '人工'>, vendorName: string) {
  return `${projectId}::${sourceType}::${vendorName}`;
}

export async function getQuoteCostProjectsWithReconciliationGroups(): Promise<FinancialProjectWithGroups[]> {
  const projects = await getQuoteCostProjectsWithDbFinancials();

  return projects.map((project) => {
    const groupMap = new Map<string, FinancialReconciliationGroup>();

    project.costItems
      .filter((item): item is CostLineItem & { sourceType: Exclude<CostSourceType, '人工'> } => item.sourceType !== '人工')
      .filter((item) => item.vendorName && item.includedInCost)
      .forEach((item) => {
        const vendorName = item.vendorName as string;
        const key = buildGroupKey(project.id, item.sourceType, vendorName);
        const existing = groupMap.get(key);
        if (existing) {
          existing.amountTotal += item.adjustedAmount;
          existing.itemCount += 1;
          existing.items.push(item);
          return;
        }

        groupMap.set(key, {
          key,
          projectId: project.id,
          projectName: project.projectName,
          sourceType: item.sourceType,
          vendorName,
          amountTotal: item.adjustedAmount,
          itemCount: 1,
          items: [item],
          reconciliationStatus: project.reconciliationStatus === '已完成' ? '已對帳' : project.reconciliationStatus === '待確認' ? '待確認' : '未對帳',
        });
      });

    return {
      ...project,
      reconciliationGroups: Array.from(groupMap.values()),
    };
  });
}

export async function getQuoteCostProjectWithReconciliationGroupsById(projectId: string) {
  const projects = await getQuoteCostProjectsWithReconciliationGroups();
  return projects.find((project) => project.id === projectId) ?? null;
}
