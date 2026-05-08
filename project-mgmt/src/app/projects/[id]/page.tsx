import { notFound } from "next/navigation";
import { performance } from "node:perf_hooks";
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
  const pageStart = performance.now();
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const useDbProjectFlow = shouldUseDbProjectFlow();
  const resolveStartedAt = performance.now();
  const resolvedDbProjectId = useDbProjectFlow ? await resolveDbProjectIdByRouteId(id) : null;
  const resolveMs = performance.now() - resolveStartedAt;
  const projectStartedAt = performance.now();
  const project = useDbProjectFlow
    ? resolvedDbProjectId
      ? await getDbProjectById(resolvedDbProjectId)
      : null
    : getProjectById(id);
  const projectMs = performance.now() - projectStartedAt;

  if (!project) {
    notFound();
  }

  console.log('[project-detail-page]', JSON.stringify({
    routeId: id,
    useDbProjectFlow,
    resolvedDbProjectId,
    resolveMs: Number(resolveMs.toFixed(1)),
    projectMs: Number(projectMs.toFixed(1)),
    totalMs: Number((performance.now() - pageStart).toFixed(1)),
  }));

  return (
    <AppShellAuth activePath="/projects">
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
