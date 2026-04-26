import { notFound } from "next/navigation";
import { AppShellAuth } from "@/components/app-shell-auth";
import { ProjectDetailShell } from "@/components/project-detail-shell";
import { getProjectById, getProjectRouteId } from "@/components/project-data";
import { projects } from "@/components/project-data";
import { getDbProjectById, resolveDbProjectIdByRouteId } from "@/lib/db/project-flow-adapter";
import { shouldUseDbProjectFlow } from "@/lib/db/project-flow-toggle";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return projects.map((project) => ({ id: getProjectRouteId(project) }));
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ task?: string; source?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const useDbProjectFlow = shouldUseDbProjectFlow();
  const resolvedDbProjectId = useDbProjectFlow ? await resolveDbProjectIdByRouteId(id) : null;
  const project = useDbProjectFlow
    ? resolvedDbProjectId
      ? await getDbProjectById(resolvedDbProjectId)
      : null
    : getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <AppShellAuth activePath="/projects" contentSurfaceClassName="rounded-[34px] border border-white/6 bg-transparent p-0 shadow-none backdrop-blur-none">
      <ProjectDetailShell
        project={project}
        entryContext={{
          task: resolvedSearchParams.task,
          source: resolvedSearchParams.source,
        }}
      />
    </AppShellAuth>
  );
}
