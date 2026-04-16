import { AppShellAuth } from "@/components/app-shell-auth";
import { ProjectsPageClient } from "@/components/projects-page-client";
import { projects } from "@/components/project-data";
import { listDbProjects } from "@/lib/db/project-flow-adapter";
import { shouldUseDbProjectFlow } from "@/lib/db/project-flow-toggle";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const useDbProjectFlow = shouldUseDbProjectFlow();
  const initialProjects = (useDbProjectFlow ? await listDbProjects() : projects).filter(
    (project) => project.status !== '已結案',
  );

  return (
    <AppShellAuth activePath="/projects">
      <ProjectsPageClient initialProjects={initialProjects} />
    </AppShellAuth>
  );
}
