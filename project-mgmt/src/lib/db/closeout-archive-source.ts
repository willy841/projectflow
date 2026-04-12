import {
  getQuoteCostProjectByIdWithDbFinancials,
  getQuoteCostProjectsWithDbFinancials,
  type QuoteCostProjectWithGroups,
} from '@/lib/db/financial-flow-adapter';
import type { QuoteCostProject } from '@/components/quote-cost-data';

function isClosedProject<T extends { projectStatus: string }>(project: T) {
  return project.projectStatus === '已結案';
}

export async function getCloseoutArchiveProjects(): Promise<QuoteCostProject[]> {
  const projects = await getQuoteCostProjectsWithDbFinancials();
  return projects.filter(isClosedProject);
}

export async function getCloseoutArchiveProjectById(projectId: string): Promise<QuoteCostProjectWithGroups | null> {
  const project = await getQuoteCostProjectByIdWithDbFinancials(projectId);
  if (!project || !isClosedProject(project)) return null;
  return project;
}
