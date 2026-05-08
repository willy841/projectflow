import { formatCurrency, type QuoteCostProject } from '@/components/quote-cost-data';
import type { Project } from '@/components/project-data';
import { getQuoteCostProjectsWithDbFinancials } from '@/lib/db/financial-flow-adapter';
import { buildProjectFinancialSummary } from '@/lib/db/project-financial-summary-read-model';
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

  const summary = buildProjectFinancialSummary(financial);

  return {
    ...project,
    budget: formatCurrency(summary.quotationTotal),
    cost: formatCurrency(summary.projectCostTotal),
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

    const summary = buildProjectFinancialSummary(financial);

    return {
      ...project,
      budget: formatCurrency(summary.quotationTotal),
      cost: formatCurrency(summary.projectCostTotal),
    };
  });
}
