import { ProjectsPageClient } from "@/components/projects-page-client";
import { projects } from "@/components/project-data";
import { listDbProjects } from "@/lib/db/project-flow-adapter";
import { shouldUseDbProjectFlow } from "@/lib/db/project-flow-toggle";

export default async function ProjectsPage() {
  const dbProjects = shouldUseDbProjectFlow() ? await listDbProjects() : [];
  const mergedProjects = [...dbProjects, ...projects.filter((project) => !dbProjects.some((dbProject) => dbProject.id === project.id))];

  return <ProjectsPageClient initialProjects={mergedProjects} />;
}
