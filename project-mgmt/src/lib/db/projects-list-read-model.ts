import { formatCurrency, getProjectCostTotal, getQuotationTotal, type QuoteCostProject } from '@/components/quote-cost-data';
import type { Project } from '@/components/project-data';
import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import { listDbProjects, type DbBackedProject } from '@/lib/db/project-flow-adapter';

type FinancialLookup = Map<string, QuoteCostProject>;

function buildFinancialLookup(financialProjects: QuoteCostProject[]): FinancialLookup {
  return new Map(financialProjects.map((project) => [project.id, project]));
}

function mergeProjectFinancial(project: DbBackedProject, financialLookup: FinancialLookup): DbBackedProject {
  const financial = financialLookup.get(project.id);
  if (!financial) {
    return {
      ...project,
      budget: '-',
      cost: '-',
    };
  }

  return {
    ...project,
    budget: formatCurrency(getQuotationTotal(financial.quotationItems, financial.quotationImport)),
    cost: formatCurrency(getProjectCostTotal(financial.costItems)),
  };
}

export async function listDbProjectsWithFinancialSummary(): Promise<DbBackedProject[]> {
  const [projects, financialProjects] = await Promise.all([
    listDbProjects(),
    getQuoteCostProjectsWithDbFinancials(),
  ]);

  const financialLookup = buildFinancialLookup(financialProjects);
  return projects.map((project) => mergeProjectFinancial(project, financialLookup));
}

export function mergeMockProjectsWithFinancialSummary(
  projects: Project[],
  financialProjects: QuoteCostProject[],
): Project[] {
  const financialLookup = buildFinancialLookup(financialProjects);

  return projects.map((project) => {
    const financial = financialLookup.get(project.id);
    if (!financial) return project;

    return {
      ...project,
      budget: formatCurrency(getQuotationTotal(financial.quotationItems, financial.quotationImport)),
      cost: formatCurrency(getProjectCostTotal(financial.costItems)),
    };
  });
}
