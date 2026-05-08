import type { ProjectFinancialSummary } from '@/lib/db/project-financial-summary-read-model';

export type ProjectFinancialSummaryTotals = ProjectFinancialSummary;

export type ActiveProjectFinancialSummaryTotals = ProjectFinancialSummaryTotals & {
  collectedTotal: number;
  outstandingTotal: number;
};
