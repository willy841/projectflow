import { ProjectsPageClient } from "@/components/projects-page-client";
import { projects } from "@/components/project-data";
import { listDbProjects } from "@/lib/db/project-flow-adapter";
import { shouldUseDbProjectFlow } from "@/lib/db/project-flow-toggle";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const useDbProjectFlow = shouldUseDbProjectFlow();
  const initialProjects = useDbProjectFlow ? await listDbProjects() : projects;

  return <ProjectsPageClient initialProjects={initialProjects} />;
}
