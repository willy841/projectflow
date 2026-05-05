import { AppShellAuth } from "@/components/app-shell-auth";
import { ProjectsPageClient } from "@/components/projects-page-client";
import { projects } from "@/components/project-data";
import { getQuoteCostProjectsWithDbFinancials } from "@/lib/db/financial-flow-adapter";
import { shouldUseDbProjectFlow } from "@/lib/db/project-flow-toggle";
import { listDbProjectsWithFinancialSummary, mergeMockProjectsWithFinancialSummary } from "@/lib/db/projects-list-read-model";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const useDbProjectFlow = shouldUseDbProjectFlow();
  const initialProjects = (
    useDbProjectFlow
      ? await listDbProjectsWithFinancialSummary()
      : mergeMockProjectsWithFinancialSummary(projects, await getQuoteCostProjectsWithDbFinancials())
  ).filter((project) => project.status !== '已結案');

  return (
    <AppShellAuth activePath="/projects">
      <ProjectsPageClient initialProjects={initialProjects} />
    </AppShellAuth>
  );
}
