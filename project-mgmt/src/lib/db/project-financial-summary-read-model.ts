import { getGrossProfit, getProjectCostTotal, getQuotationTotal, type QuoteCostProject } from '@/components/quote-cost-data';

export type ProjectFinancialSummary = {
  quotationTotal: number;
  projectCostTotal: number;
  grossProfit: number;
};

export function buildProjectFinancialSummary(project: Pick<QuoteCostProject, 'quotationItems' | 'quotationImport' | 'costItems'>): ProjectFinancialSummary {
  const quotationTotal = getQuotationTotal(project.quotationItems, project.quotationImport);
  const projectCostTotal = getProjectCostTotal(project.costItems);
  const grossProfit = getGrossProfit(quotationTotal, projectCostTotal);

  return {
    quotationTotal,
    projectCostTotal,
    grossProfit,
  };
}
