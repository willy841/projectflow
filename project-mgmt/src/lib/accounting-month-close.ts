import type { QuoteCostProject } from '../components/quote-cost-data';

export type AccountingMonthCloseRow = {
  projectId: string;
  projectName: string;
  eventDate: string;
  totalAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
};

function normalizeMoney(value: number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function getProjectQuoteTotal(project: QuoteCostProject) {
  return normalizeMoney(
    project.quotationItems.reduce(
      (sum, item) => sum + normalizeMoney(item.quantity) * normalizeMoney(item.unitPrice),
      0,
    ),
  );
}

export function buildAccountingMonthCloseRows(
  projects: QuoteCostProject[],
  collectedByProjectId: Map<string, number>,
  month: string,
): AccountingMonthCloseRow[] {
  return projects
    .filter((project) => project.eventDate.startsWith(month))
    .map((project) => {
      const totalAmount = getProjectQuoteTotal(project);
      const collectedAmount = normalizeMoney(collectedByProjectId.get(project.id));
      return {
        projectId: project.id,
        projectName: project.projectName,
        eventDate: project.eventDate,
        totalAmount,
        collectedAmount,
        outstandingAmount: Math.max(totalAmount - collectedAmount, 0),
      };
    })
    .sort((a, b) => {
      const byDate = a.eventDate.localeCompare(b.eventDate);
      if (byDate !== 0) return byDate;
      const byName = a.projectName.localeCompare(b.projectName, 'zh-Hant');
      if (byName !== 0) return byName;
      return a.projectId.localeCompare(b.projectId);
    });
}
